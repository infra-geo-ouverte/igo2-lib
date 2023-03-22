import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RecordParametersComponent } from './record-parameters/record-parameters.component';
import { GpxSelectionComponent } from './gpx-selection/gpx-selection.component';
import olGeolocation from 'ol/Geolocation';
import * as olSphere from 'ol/sphere';

import { MapService } from '../shared/map.service';
import { downloadContent } from '@igo2/utils';
import {transform} from 'ol/proj';
import { MapGeolocationController } from '../shared';
import { MessageService } from '@igo2/core';
import Feature from 'ol/Feature';
import { LineString } from 'ol/geom';
import { VectorLayer } from '../../layer';
import { QueryableDataSourceOptions } from '../../query';
import { FeatureDataSource, FeatureDataSourceOptions } from '../../datasource';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { GeoDBService, InsertSourceInsertDBEnum } from '../../offline';
import NoSleep from 'nosleep.js';
import { StyleService } from '../../style/style-service/style.service';

interface PositionDetailed {
  coordinates: number[];
  timeStamp: string;
}

@Component({
  selector: 'igo-record-button',
  templateUrl: './record-button.component.html',
  styleUrls: ['./record-button.component.scss']
})
export class RecordButtonComponent implements OnInit {

  isRecording = false;
  timerKey = null;
  pointIntervalKey = null;
  geolocation: olGeolocation;
  fileNames: string[] = [];
  geoMap: MapGeolocationController;
  position: number[];
  startTime: Date;
  currentTime: Date;
  recordParameters: any;
  timePassed: number = 0;
  lineString: LineString;
  positionSubscription: Subscription;
  noSleep: NoSleep = new NoSleep();
  geolocationListener: () => any;


  intervalId = null;
  routeFeatures : PositionDetailed[] = [];

  constructor(
    public dialog: MatDialog,
    private mapService: MapService,
    private styleService: StyleService,
    private messageService: MessageService,
    private geoDBService: GeoDBService
    ) {
    }

  ngOnInit(): void {
    this.mapService.getMap().ol.once('rendercomplete', () => {
      this.geoDBService.get('layerRecording').subscribe(async (res) => {
        if(res) {
          this.timePassed = (new Date()).getTime() - res.startTime;
          this.startTime = new Date();
          this.currentTime = new Date();
          this.recordParameters = res.recordParameters;
          this.routeFeatures = res.points;
          this.createLineString();
          this.record();
        }
      });
    });
  }

  /**
   * @param coord1 Coordinates of origin point
   * @param coord2 Coordinates of destination point
   * @returns Distance between points in km
   */
  distanceBetweenPoints(coord1: number[], coord2: number[]): number{
    return olSphere.getDistance(coord1, coord2) / 1000;
  }

  /**
   * Starts recording track, stops the recording if already started
   */
  record() {
    if(!this.isRecording) {
      if(!this.recordParameters) {
        const dialogRef = this.dialog.open(RecordParametersComponent);
        dialogRef.afterClosed().subscribe(result => {
          if(result) {
            this.setUpRecordListeners(result);
          }
        });
      }
      else {
        this.setUpRecordListeners(this.recordParameters);
      }
    }
    else {
      const dialogRef = this.dialog.open(PauseStopComponent);
      dialogRef.afterClosed().subscribe(paused => {
        if(paused !== undefined) {
          this.pauseRecording();
        }
        if(paused === false){
          this.saveFile();
        }
      });
    }
  }


  private setUpRecordListeners(result: any) {
    if(result !== undefined) {
      if(!result.fileName || !result.amountInput) {
        this.messageService.alert('igo.geo.record-prompts.badInputs');
        return;
      }
      if(!this.mapService.getMap()) {
        this.messageService.alert('igo.geo.record-prompts.mapNotRendered');
        return;
      }
      this.geoMap = this.mapService.getMap().geolocationController;
      if(!this.geoMap.position$.value || !this.geoMap.position$.value.position) {
        this.messageService.alert('igo.geo.record-prompts.positionNotFound');
        return;
      }
      if(!this.recordParameters && !this.isRecording && this.fileNames.length > 0) {
        const resultsLayer = this.mapService.getMap().getLayerById(this.fileNames[0]);
        if (resultsLayer !== undefined) {
          this.mapService.getMap().removeLayer(resultsLayer);
        }
      }
      this.noSleep.enable();
      this.startTime = new Date();
      this.currentTime = new Date();
      this.recordParameters = result;
      const startingPosition: PositionDetailed = {
        coordinates: transform(this.geoMap.position$.value.position, 'EPSG:3857', 'EPSG:4326'),
        timeStamp: new Date().toLocaleString().replace(', ', 'T')
      };
      this.routeFeatures.push(startingPosition);
      this.setFileName(result.fileName).subscribe((namingIsOver) => {
        if(namingIsOver === true) {
          if(!this.lineString) {
            this.createLineString();
          }
          this.positionSubscription = this.geoMap.position$.subscribe(() => {
            for(let i = this.lineString.getCoordinates().length; i<this.routeFeatures.length; i++){
              this.lineString.appendCoordinate(transform(
                [this.routeFeatures[i].coordinates[0],this.routeFeatures[i].coordinates[1]],
                'EPSG:4326', 'EPSG:3857'));
            }
            this.updatePointsArrayDb();
          });
        }
      });
      this.isRecording = !this.isRecording;
      this.timerKey = setInterval(() => {
        this.currentTime = new Date();
      }, 1000);
      if(result.intervalMode === 'time') {
        this.setUpTimeIntervalObserver();
      }
      else if(result.intervalMode === 'distance') {
        this.setUpDistanceIntervalObserver();
      }
    }
  }

  private setFileName(name: string): BehaviorSubject<boolean> {
    let fileArray: File[] = [];
    let namingOverSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
    this.geoDBService.get('recordedTraces').pipe(take(1)).subscribe((res) => {
      if(res) {
        fileArray = res;
      }
      const regex = new RegExp('(.*?)(?:\\ \\((\\d+)\\))?(\\.[^.]*)$');
      let trackNameNumber = -1;
      let pointsNameNumber = -1;
      for(let file of fileArray) {
        const regexResult = regex.exec(file.name);
        if(regexResult[1] === name+'_track') {
          if(!regexResult[2] && trackNameNumber === -1)
            trackNameNumber = 1;
          else if(parseInt(regexResult[2]) >= trackNameNumber)
            trackNameNumber = parseInt(regexResult[2]) + 1;
        }
        if(regexResult[1] === name+'_points') {
          if(!regexResult[2] && pointsNameNumber === -1)
            pointsNameNumber = 1;
          else if(parseInt(regexResult[2]) >= pointsNameNumber)
            pointsNameNumber = parseInt(regexResult[2]) + 1;
        }
      }
      if(trackNameNumber !== -1) {
        this.fileNames[0] = name + `_track (${trackNameNumber}).gpx`;
      }
      else {
        this.fileNames[0] = name + '_track.gpx';
      }
      if(pointsNameNumber !== -1) {
        this.fileNames[1] = name + `_points (${pointsNameNumber}).gpx`;
      }
      else {
        this.fileNames[1] = name + '_points.gpx';
      }
      namingOverSubject.next(true);
    });
    return namingOverSubject;
  }

  updatePointsArrayDb() {
    if (this.routeFeatures.length > 0) {
      this.geoDBService.get('layerRecording').subscribe(async (res) => {
        if(!res) {
          res = {
            startTime: this.startTime,
            recordParameters: this.recordParameters,
            points: this.routeFeatures
          };
        }
        else {
          res.points = this.routeFeatures;
        }
        this.geoDBService.update('layerRecording',
        'layerRecording',
          res,InsertSourceInsertDBEnum.System,
          'layerRecording'
        ).subscribe((r) => {});
      });
    }
  }

  setUpTimeIntervalObserver() {
    this.geolocationListener = this.geoMap.addOnChangedListener((geo: olGeolocation) => {
      if(geo.getPosition()) {
        this.position = transform(geo.getPosition(), 'EPSG:3857', 'EPSG:4326');
      }
    });
    this.pointIntervalKey = setInterval(() => {
      if(this.position) {
        const position = this.position;
        let distance = 1;
        if(this.routeFeatures.length > 0) {
          distance = this.distanceBetweenPoints(position, this.routeFeatures[this.routeFeatures.length-1].coordinates);
        }
        if(distance >= 0.001) {
          const point : PositionDetailed = {
            coordinates: position,
            timeStamp: new Date().toLocaleString().replace(', ', 'T')
          };
          this.routeFeatures.push(point);
        }
      }
    }, this.recordParameters.amountInput * 1000);
  }

  setUpDistanceIntervalObserver() {
    this.geolocationListener = this.geoMap.addOnChangedListener((geo: olGeolocation) => {
      if(geo.getPosition()) {
        const position = transform(geo.getPosition(), 'EPSG:3857', 'EPSG:4326');
        let distance = -1;
        if(this.routeFeatures.length > 0) {
          distance = this.distanceBetweenPoints(position, this.routeFeatures[this.routeFeatures.length-1].coordinates);
        }
        if(distance >= this.recordParameters.amountInput / 1000) {
          const point : PositionDetailed = {
            coordinates: position,
            timeStamp: new Date().toLocaleString().replace(', ', 'T')
          };
          this.routeFeatures.push(point);
        }
      }
    });
  }

  private createLineString() {
    let coordsArray: number[][] = new Array(this.routeFeatures.length);
    for (var i = 0; i < this.routeFeatures.length; i++) {
      let coords: number[] = [this.routeFeatures[i].coordinates[0],this.routeFeatures[i].coordinates[1]];
      coordsArray[i] = transform(coords, 'EPSG:4326', 'EPSG:3857');
    }

    this.lineString = new LineString(coordsArray);

    var featureLine = new Feature({
        geometry: this.lineString
    });
    this.addLayerToMap([featureLine], this.fileNames[0], 'trace position');
  }

  private addLayerToMap(features: any[], layerId: string, layerName: string) {
    const baseStyle = {
      stroke: { color: "red",
                width: 3 }
    };

    const style = this.styleService.createStyle(baseStyle);
    const sourceOptions: FeatureDataSourceOptions & QueryableDataSourceOptions = {
      queryable: true,
      type: 'vector'
    };
    const featureSource = new FeatureDataSource(sourceOptions);
    featureSource.ol.addFeatures(features);
    const resultsLayer = this.mapService.getMap().getLayerById(layerId);
    if (resultsLayer !== undefined) {
      this.mapService.getMap().removeLayer(resultsLayer);
    }

    const date = new Date();
    const today = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
    const time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

    const layer = new VectorLayer({
      title: `${layerName} ${today} ${time}`,
      source: featureSource,
      sourceOptions: sourceOptions,
      id: layerId,
      style: style,
    });
    this.mapService.getMap().addLayer(layer);
  }

  pauseRecording() {
    this.noSleep.disable();
    clearInterval(this.timerKey);
    clearInterval(this.pointIntervalKey);
    this.geoMap.deleteChangedListener(this.geolocationListener);
    this.timePassed += this.currentTime.getTime() - this.startTime.getTime();
    this.currentTime = new Date();
    this.startTime = new Date();
    this.isRecording = !this.isRecording;
    this.positionSubscription.unsubscribe();
  }

  stopRecording() {
    this.geoDBService.deleteByKey("layerRecording").subscribe();
    this.lineString = undefined;
    this.routeFeatures = [];
    this.recordParameters = undefined;
    this.timePassed = 0;
  }

  /**
   * Formats in HH:MM:SS a number of seconds
   */
  getTimeRecording() {
    const time = this.currentTime.getTime() - this.startTime.getTime();
    let formattedTime = new Date(time + this.timePassed).toISOString().substring(11,19);
    return formattedTime;
  }

  ngOnDestroy(): void {
    clearInterval(this.timerKey);
    clearInterval(this.pointIntervalKey);
  }

  /**
   * Creates Blob objects for gpx files and then downloads them
   */
  saveFile() {
    if(this.routeFeatures.length > 0) {
      const dialogRef = this.dialog.open(GpxSelectionComponent, {
      width: '25em'});
      dialogRef.afterClosed().subscribe(async (result) => {
        if(result === undefined) {
          this.record();
          return;
        }
        const xml = '<?xml version="1.0" encoding="utf-8"?>\n';
        let gpxTrackText = xml + '<gpx>\n<trk>\n  <trkseg>\n';
        let gpxPointsText = xml + '<gpx>\n';
        this.routeFeatures.forEach((point) => {
          const pointData = `      <time>${point.timeStamp}</time>\n`;
          gpxTrackText += `    <trkpt lat="${point.coordinates[1]}" lon="${point.coordinates[0]}">\n`
                      + pointData
                      + '    </trkpt>\n';
          gpxPointsText += `  <wpt lat="${point.coordinates[1]}" lon="${point.coordinates[0]}">\n`
                        + pointData.replace(/(      )+/g, `    `)
                        + '  </wpt>\n';
        });
        gpxTrackText += '  </trkseg>\n</trk>\n</gpx>';
        gpxPointsText += '</gpx>';

        const reservedChars = "|\\?*<\":>+[]/'";

        for(let i = 0; i<reservedChars.length; i++) {
          for(let name of this.fileNames) {
            name = name.replace(reservedChars.charAt(i), "&");
          }
        }

        if(result === 'both') {
          downloadContent(gpxTrackText, 'text/xml;charset=utf-8', this.fileNames[0]);
          downloadContent(gpxPointsText, 'text/xml;charset=utf-8', this.fileNames[1]);
          this.updateIndexedDBFiles([new File([gpxTrackText], this.fileNames[0]),
                                     new File([gpxPointsText], this.fileNames[1])]);
        }
        else if(result === 'track') {
          downloadContent(gpxTrackText, 'text/xml;charset=utf-8', this.fileNames[0]);
          this.updateIndexedDBFiles([new File([gpxTrackText], this.fileNames[0])]);
        }
        else if(result === 'points') {
          downloadContent(gpxPointsText, 'text/xml;charset=utf-8', this.fileNames[1]);
          this.updateIndexedDBFiles([new File([gpxPointsText], this.fileNames[1])]);
        }
        this.stopRecording();
        if(result === 'noDownload') {
          const resultsLayer = this.mapService.getMap().getLayerById(this.fileNames[0]);
          if (resultsLayer !== undefined) {
            this.mapService.getMap().removeLayer(resultsLayer);
          }
        }
        else {
          this.messageService.success('igo.geo.record-prompts.gpxDownloadedToast');
        }
      });
    }
    else {
      this.messageService.alert('igo.geo.record-prompts.gpxIsEmpty');
      this.stopRecording();
    }
  }

  updateIndexedDBFiles(files: File[]) {
    let fileArray: File[] = [];
    this.geoDBService.get('recordedTraces').subscribe(async (res) => {
      if(res) {
        fileArray = res;
      }
      for await (const file of files) {
        fileArray.push(file);
      };
      this.geoDBService.update('recordedTraces',
        fileArray.length,
        fileArray,
        InsertSourceInsertDBEnum.System,
        'recordedTraces'+fileArray.length
      );
    });
  }
}

@Component({
  selector: 'igo-pause-or-stop',
  template: `
    <div mat-dialog-content style="width: fit-content;">
      <button mat-button [mat-dialog-close]="true">{{'igo.geo.record-prompts.pause' | translate}}</button>
      <button mat-button [mat-dialog-close]="false">{{'igo.geo.record-prompts.stop' | translate}}</button>
    </div>
  `
})
export class PauseStopComponent {
  constructor(
    public dialogRef: MatDialogRef<PauseStopComponent>
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

import { Component, Inject, Input } from '@angular/core';
import { LanguageService } from '@igo2/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CoordinatesUnit, GeometryType, LabelType } from '../shared/draw.enum';
import { transform } from 'ol/proj';
import { IgoMap } from '../../map/shared';
import OlFeature from 'ol/Feature';
import {
  measureOlGeometryLength,
  measureOlGeometryArea,
  metersToUnit,
  squareMetersToUnit
} from '../../measure/shared/measure.utils';
import {
  MeasureLengthUnit,
  MeasureLengthUnitAbbreviation,
  MeasureAreaUnit,
  MeasureAreaUnitAbbreviation,
} from '../../measure/shared/measure.enum';

import {fromCircle} from 'ol/geom/Polygon';
import { getLength } from 'ol/sphere';
import Circle from 'ol/geom/Circle';
import { DDtoDMS } from '../shared/draw.utils';


export interface DialogData {
  label: string;
}

@Component({
  selector: 'igo-draw-popup-component',
  templateUrl: './draw-popup.component.html',
  styleUrls: ['./draw-popup.component.scss']
  })
export class DrawPopupComponent {
  @Input() confirmFlag: boolean = false;
  @Input() labelFlag: LabelType = LabelType.Predefined;
  @Input() measureUnit: MeasureLengthUnit | MeasureAreaUnit | CoordinatesUnit;

  public geometryType = GeometryType;
  public labelType = LabelType;

  public currentLabel: string;
  public currentCoordinates: string;
  public currentArea: string;
  public currentLength: string;

  public olGeometryType: GeometryType = undefined;
  public lengthInMeters: string;
  public areaInMetersSquare: string;
  public coordinatesInDD: string;
  public currentCoordinatesUnit: string;

  private longlatDD: [number, number];

  constructor(
    private languageService: LanguageService,
    public dialogRef: MatDialogRef<DrawPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { olGeometry: any, map: IgoMap }
    ){
      this.currentLabel = this.data.olGeometry.get('draw');

      let olGeometry;

      const projection = this.data.map.ol.getView().getProjection();

      if(this.data.olGeometry instanceof OlFeature) {
        if (this.data.olGeometry.get('rad')){
          const longitudeLatitude = [this.data.olGeometry.get('longitude'), this.data.olGeometry.get('latitude')];
          this.olGeometryType = GeometryType.Circle;
          olGeometry = new Circle(longitudeLatitude, this.data.olGeometry.get('rad'));
        }
        else{
          this.olGeometryType = this.data.olGeometry.getGeometry().getType();
          olGeometry = this.data.olGeometry.get('geometry');
        }
        this.measureUnit = this.data.olGeometry.get('measureUnit');

      }
      else{
        this.olGeometryType = this.data.olGeometry.getType();
        olGeometry = this.data.olGeometry;
      }

      if (this.olGeometryType === GeometryType.Point || this.olGeometryType === GeometryType.Circle){
        if(this.data.olGeometry instanceof OlFeature){
          let longitude = this.data.olGeometry.get('longitude').toFixed(4);
          let latitude = this.data.olGeometry.get('latitude').toFixed(4);
          this.longlatDD = [longitude, latitude];
          this.coordinatesInDD = '(' + latitude + ', '
          + longitude + ')';
        }
        else {
          let point4326 = transform(
            this.data.olGeometry.getFlatCoordinates(),
            projection,
            'EPSG:4326'
          );
          this.longlatDD = [Number(point4326[0].toFixed(4)), Number(point4326[1].toFixed(4))];
          this.coordinatesInDD =
            '(' + point4326[1].toFixed(4) + ', ' + point4326[0].toFixed(4) + ')';
        }
        this.currentCoordinates = this.coordinatesInDD;
      }
      if (this.olGeometryType === GeometryType.LineString){
        this.lengthInMeters = measureOlGeometryLength(olGeometry, projection.getCode()).toFixed(2);
        this.currentLength = this.lengthInMeters;
      }
      else if (this.olGeometryType === GeometryType.Polygon){
        this.lengthInMeters = measureOlGeometryLength(olGeometry, projection.getCode()).toFixed(2);
        this.currentLength = this.lengthInMeters;
        this.areaInMetersSquare = measureOlGeometryArea(olGeometry,projection.getCode()).toFixed(2);
        this.currentArea = this.areaInMetersSquare;
      }
      else if(this.olGeometryType === GeometryType.Circle){
        let circularPolygon = fromCircle(olGeometry, 10000);
        const radius = this.getRadius(circularPolygon);
        this.lengthInMeters = radius.toFixed(2);
        this.currentLength = this.lengthInMeters;
        this.areaInMetersSquare = measureOlGeometryArea(circularPolygon,projection.getCode()).toFixed(2);
        this.currentArea = this.areaInMetersSquare;
      }
    }
  cancelDrawing() {
    this.dialogRef.close();
  }
  confirm(input?: string) {
    this.confirmFlag = true;
    if(this.labelFlag === LabelType.Predefined){
      this.dialogRef.close();
    }
    else if(this.labelFlag === LabelType.Coordinates){
      this.dialogRef.close(this.currentCoordinates);
    }
    else if (this.labelFlag === LabelType.Length){
      if (this.olGeometryType === GeometryType.Circle){
        this.dialogRef.close('R: ' + this.currentLength + ' ' + MeasureLengthUnitAbbreviation[this.measureUnit]);
      }
      else if (this.olGeometryType === GeometryType.Polygon){
        this.dialogRef.close('P: ' + this.currentLength + ' ' + MeasureLengthUnitAbbreviation[this.measureUnit]);
      }
      else{
        this.dialogRef.close(this.currentLength + ' ' + MeasureLengthUnitAbbreviation[this.measureUnit]);
      }
    }
    else if (this.labelFlag === LabelType.Area){
      this.dialogRef.close(this.currentArea + ' ' + MeasureAreaUnitAbbreviation[this.measureUnit]);
    }
    else if (this.labelFlag === LabelType.Custom){
      this.dialogRef.close(input);
    }
  }
  onLabelTypeChange(labelType: LabelType){
    this.labelFlag = labelType;
    if (labelType === LabelType.Area){
      this.currentArea = this.areaInMetersSquare;
      this.measureUnit = MeasureAreaUnit.SquareMeters;
    }
    else if (this.labelFlag === LabelType.Length){
      this.currentLength = this.lengthInMeters;
      this.measureUnit = MeasureLengthUnit.Meters;
    }
    else if (this.labelFlag === LabelType.Coordinates){
      this.currentCoordinates = this.coordinatesInDD;
      this.measureUnit = CoordinatesUnit.DecimalDegree;
    }
  }

  get arrayBuiltInType(): string[]{
    let arrayBILabels = [];
    for (const labelType of Object.values(LabelType)){
      if (labelType !== LabelType.Custom && labelType !== LabelType.Predefined){
        arrayBILabels.push(labelType);
      }
    }
    return arrayBILabels;
  }

  noLabelButton(){
    if (this.labelFlag === LabelType.Predefined){
      return this.languageService.translate.instant('igo.geo.draw.noLabel');
    }
    return 'OK';
  }

  optionAvailable(currentOption: LabelType){
    switch(this.olGeometryType){
      case GeometryType.Point:
        if (currentOption === LabelType.Coordinates){
          return false;
        }
        return true;
      case GeometryType.LineString:
        if (currentOption === LabelType.Length){
          return false;
        }
        return true;
      case GeometryType.Polygon:
        if (currentOption === LabelType.Coordinates){
          return true;
        }
        return false;
      default:
        return false;
    }
  }


  onChangeLengthUnit(lengthUnit: MeasureLengthUnit){
    this.measureUnit = lengthUnit;
    this.currentLength = metersToUnit(Number(this.lengthInMeters), lengthUnit).toFixed(2);
  }

  onChangeAreaUnit(areaUnit: MeasureAreaUnit){
    this.measureUnit = areaUnit;
    this.currentArea = squareMetersToUnit(Number(this.areaInMetersSquare), areaUnit).toFixed(2);
  }

  onChangeCoordinateUnit(coordinatesUnit: CoordinatesUnit){
    this.measureUnit = coordinatesUnit;
    let coordinates = DDtoDMS(this.longlatDD, coordinatesUnit);
    this.currentCoordinates = '(' + coordinates[1] + ', ' + coordinates[0] + ')';
  }

  get allLengthUnits(): string[]{
    return Object.values(MeasureLengthUnit);
  }

  getLengthUnitEnum(lengthUnit: MeasureLengthUnit){
    return MeasureLengthUnitAbbreviation[lengthUnit];
  }

  get allAreaUnits(): string[]{
    return Object.values(MeasureAreaUnit);
  }

  get allCoordinatesUnits(): string[]{
    return Object.values(CoordinatesUnit);
  }

  getAreaUnitEnum(areaUnit: MeasureAreaUnit){
    return MeasureAreaUnitAbbreviation[areaUnit];
  }

  private getRadius(olGeometry): number{
    const length = getLength(olGeometry);
    return Number(length / (2 * Math.PI));
  }

  get lengthLabelT(){
    if (this.olGeometryType === GeometryType.Polygon){
      return this.languageService.translate.instant('igo.geo.measure.perimeter');
    }
    if (this.olGeometryType === GeometryType.Circle){
      return this.languageService.translate.instant('igo.geo.search.coordinates.radius');
    }
  }


}

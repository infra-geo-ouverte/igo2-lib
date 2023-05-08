import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ConfirmDialogService } from '@igo2/common';
import { LanguageService, MessageService, StorageScope, StorageService } from '@igo2/core';
import { downloadContent } from '@igo2/utils';
import { Feature } from '../../../feature';
import { handleFileImportSuccess, ImportService } from '../../../import-export';
import { GeoDBService, InsertSourceInsertDBEnum } from '../../../offline';
import { MapService } from '../../shared';

enum Display {
  Choice = 1,
  TrackHistory = 2,
  RecordTrack = 3
}
@Component({
  selector: 'igo-record-parameters',
  templateUrl: './record-parameters.component.html',
  styleUrls: ['./record-parameters.component.scss']
})
export class RecordParametersComponent implements OnInit{

  intervalMode: string = 'time';
  amountInput: number;
  fileName: string;
  display = Display;
  stateAffichage: Display = Display.Choice;
  trackFiles: (File)[];
  @ViewChild(MatTable) table:MatTable<any>;

  constructor(private dialogRef: MatDialogRef<RecordParametersComponent>,
              private importService: ImportService,
              private mapService: MapService,
              private messageService: MessageService,
              private languageService: LanguageService,
              private geoDBService: GeoDBService,
              private confirmDialogService: ConfirmDialogService,
              private storageService: StorageService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.geoDBService.get('recordedTraces').subscribe((res) => {
      if(res) {
        this.trackFiles = res;
        this.trackFiles.sort((a, b) => a.name.localeCompare(b.name));
      }
    });
  }

  loadFile(file: File) {
    this.importService.import(file, 'EPSG:4326').subscribe(
      (features: Feature[]) => {
        this.onFileImportSuccess(file, features);
      },
      (error: Error) => {
        console.log(error);
      }
    );
  }

  deleteGPXFile(file: File) {
    this.confirmDialogService.open(this.languageService.translate.instant(
      'igo.geo.record-prompts.confirmDeleteRecording'
    )).subscribe((res) => {
      if(res === true) {
        const fileName = file.name;
        let resultsLayer = this.mapService.getMap().getLayerById(fileName);
        if (resultsLayer === undefined)
          resultsLayer = this.mapService.getMap().layers.find(layer => layer.title === fileName.substring(0, fileName.lastIndexOf('.')));
        if (resultsLayer !== undefined) {
          this.mapService.getMap().removeLayer(resultsLayer);
        }
        this.trackFiles.splice(this.trackFiles.indexOf(file), 1);
        this.geoDBService.update('recordedTraces', this.trackFiles.length, this.trackFiles,
                          InsertSourceInsertDBEnum.System,'recordedTraces'+this.trackFiles.length);
        this.table.renderRows();
      }
    });
  }

  async downloadGPXFile(file: File) {
    const fileContent = await file.text();
    downloadContent(fileContent, 'text/xml;charset=utf-8', file.name);
  }

  getDate(dateNumber : number) {
    return (new Date(dateNumber)).toLocaleDateString();
  }

  private onFileImportSuccess(file: File, features: Feature[]) {
    handleFileImportSuccess(
      file,
      features,
      this.mapService.getMap(),
      this.messageService
    );
  }

  formReady(): boolean {
    if(this.amountInput && this.amountInput > 0 && this.fileName) {
      return true;
    }
    return false;
  }

  displayParameters() {
    const geoMap = this.mapService.getMap().geolocationController;
    if(!geoMap || !geoMap.position$.value || !geoMap.position$.value.position) {
      this.messageService.alert(this.languageService.translate.instant(
        'igo.geo.record-prompts.positionNotFound'
      ));
      this.dialogRef.close();
      return;
    }
    this.stateAffichage = this.display.RecordTrack;
  }

  /**
   * Returns object containing inputs from user
   */
  saveInputs(): any {
    this.showWarning();
    this.dialogRef.close({
      fileName: this.fileName,
      amountInput: this.amountInput,
      intervalMode: this.intervalMode,
      confirmation: false
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  showWarning() {
    // const dontShowAgain = localStorage.getItem('dontShowAgain') === 'true';
    const dontShowAgain = this.storageService.get('warningGPXRecord.dontShowAgain', StorageScope.LOCAL) === 'true';

    if (!dontShowAgain) {
      const dialogRef = this.dialog.open(WarningDialogComponent, {
        data: { dontShowAgain: dontShowAgain }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && result.dontShowAgain) {
          this.storageService.set('warningGPXRecord.dontShowAgain', 'true', StorageScope.LOCAL);
        }
      });
    }
  }

}

@Component({
  selector: 'igo-warning-dialog',
  template: `
    <h2 mat-dialog-title>{{'igo.geo.record-prompts.warning' | translate}}</h2>
    <div mat-dialog-content style='font-family:  Roboto, "Helvetica Neue", sans-serif;'>
      <p>{{'igo.geo.record-prompts.leaveAppWarning' | translate}}</p>
      <label>
      <input id="doNotShowCheck" type="checkbox" [(ngModel)]="data.dontShowAgain">
      {{'welcomeWindow.notShowCheck' | translate}}
    </label>
    </div>
    <div mat-dialog-actions>
      <button mat-raised-button [mat-dialog-close]="{ dontShowAgain: data.dontShowAgain }">OK</button>
    </div>
  `
})
export class WarningDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<WarningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dontShowAgain: boolean }
  ) {}
}

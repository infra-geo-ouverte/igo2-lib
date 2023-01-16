import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { LanguageService, MessageService } from '@igo2/core';
import { downloadContent } from '@igo2/utils';
import { Feature } from '../../../feature';
import { handleFileImportSuccess, ImportService } from '../../../import-export';
import { GeoDBService, InsertSourceInsertDBEnum } from '../../../offline';
import { MapService } from '../../shared';

enum Affichage {
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
  Affichage = Affichage;
  stateAffichage: Affichage = Affichage.Choice;
  trackFiles: (File)[];
  @ViewChild(MatTable) table:MatTable<any>;

  constructor(private dialogRef: MatDialogRef<RecordParametersComponent>,
              private importService: ImportService,
              private mapService: MapService,
              private messageService: MessageService,
              private languageService: LanguageService,
              private geoDBService: GeoDBService) { }

  ngOnInit(): void {
    this.geoDBService.get('suiviTrace').subscribe((res) => {
      if(res) {
        this.trackFiles = res;
      }
    });
  }

  async chargerFile(file: File) {
    this.importService.import(file, 'EPSG:4326').subscribe(
      (features: Feature[]) => {
        this.onFileImportSuccess(file, features);
      },
      (error: Error) => {
        console.log(error);
      }
    );
  }

  async supprimerGPXFile(file: File) {
    this.trackFiles.splice(this.trackFiles.indexOf(file), 1);
    this.geoDBService.update('suiviTrace', this.trackFiles.length, this.trackFiles,
                      InsertSourceInsertDBEnum.System,'suiviTrace'+this.trackFiles.length);
    this.table.renderRows();
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
      this.messageService,
      this.languageService
    );
  }

  formReady(): boolean {
    if(this.amountInput && this.amountInput > 0 && this.fileName) {
      return true;
    }
    return false;
  }

  /**
   * Returns object containing inputs from user
   */
  getInputs(): any {
    return {
      fileName: this.fileName,
      amountInput: this.amountInput,
      intervalMode: this.intervalMode,
      confirmation: false
    };
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

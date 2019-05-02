import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';


import { MessageService, LanguageService } from '@igo2/core';

import { Feature } from '../../feature/shared/feature.interfaces';
import { IgoMap } from '../../map/shared/map';
import { Layer } from '../../layer/shared/layers/layer';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';

import { handleFileImportSuccess, handleFileImportError } from '../shared/import.utils';
import { ExportOptions } from '../shared/export.interface';
import { ExportFormat } from '../shared/export.type';
import { ExportService } from '../shared/export.service';
import { ImportService } from '../shared/import.service';

@Component({
  selector: 'igo-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent implements OnDestroy, OnInit {

  public form: FormGroup;
  public formats = ExportFormat;
  public layers: VectorLayer[];
  public inputProj: string = 'EPSG:4326';

  private layers$$: Subscription;

  @Input() map: IgoMap;

  constructor(
    private importService: ImportService,
    private exportService: ExportService,
    private languageService: LanguageService,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.layers$$ = this.map.layers$.subscribe(layers => {
      this.layers = layers
        .filter((layer: Layer) => {
          return layer instanceof VectorLayer && layer.exportable === true;
        }) as VectorLayer[];
    });
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

  importFiles(files: File[]) {
    for (const file of files) {
      this.importService
        .import(file, this.inputProj)
        .subscribe(
          (features: Feature[]) => this.onFileImportSuccess(file, features),
          (error: Error) => this.onFileImportError(file)
        );
    }
  }

  handleExportFormSubmit(data: ExportOptions) {
    const layer = this.map.getLayerById(data.layer);
    const olFeatures = layer.dataSource.ol.getFeatures();
    this.exportService
      .export(olFeatures, data.format, layer.title, this.map.projection)
      .subscribe(() => {});
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      format: ['', [Validators.required]],
      layer: ['', [Validators.required]]
    });
  }

  private onFileImportSuccess(file: File, features: Feature[]) {
    handleFileImportSuccess(file, features, this.map, this.messageService, this.languageService);
  }

  private onFileImportError(file: File) {
    handleFileImportError(file, this.messageService, this.languageService);
  }
}

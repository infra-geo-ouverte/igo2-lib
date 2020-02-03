import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, BehaviorSubject } from 'rxjs';

import { MessageService, LanguageService, ConfigService } from '@igo2/core';

import { Feature } from '../../feature/shared/feature.interfaces';
import { IgoMap } from '../../map/shared/map';
import { ClusterDataSource } from '../../datasource/shared/datasources/cluster-datasource';
import { Layer } from '../../layer/shared/layers/layer';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';

import { handleFileExportError } from '../shared/export.utils';
import { ExportOptions } from '../shared/export.interface';
import { ExportFormat } from '../shared/export.type';
import { ExportService } from '../shared/export.service';
import { ImportService } from '../shared/import.service';
import {
  handleFileImportSuccess,
  handleFileImportError
} from '../shared/import.utils';
import { StyleService } from '../../layer/shared/style.service';
import { StyleListService } from '../style-list/style-list.service';

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
  public loading$ = new BehaviorSubject(false);

  private layers$$: Subscription;

  private espgCodeRegex = new RegExp('^\\d{4,6}');

  @Input() map: IgoMap;

  constructor(
    private importService: ImportService,
    private exportService: ExportService,
    private languageService: LanguageService,
    private messageService: MessageService,
    private styleListService: StyleListService,
    private styleService: StyleService,
    private formBuilder: FormBuilder,
    private config: ConfigService
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.layers$$ = this.map.layers$.subscribe(layers => {
      this.layers = layers.filter((layer: Layer) => {
        return layer instanceof VectorLayer && layer.exportable === true;
      }) as VectorLayer[];
    });
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

  importFiles(files: File[]) {
    let inputProj = this.inputProj;
    if (this.espgCodeRegex.test(inputProj)) {
      inputProj = `EPSG:${inputProj}`;
    }

    this.loading$.next(true);
    for (const file of files) {
      this.importService.import(file, inputProj).subscribe(
        (features: Feature[]) => this.onFileImportSuccess(file, features),
        (error: Error) => this.onFileImportError(file, error),
        () => {
          this.loading$.next(false);
        }
      );
    }
  }

  handleExportFormSubmit(data: ExportOptions) {
    this.loading$.next(true);
    const layer = this.map.getLayerById(data.layer);
    let olFeatures = layer.dataSource.ol.getFeatures();
    if (layer.dataSource instanceof ClusterDataSource) {
      olFeatures = olFeatures.flatMap((cluster: any) => cluster.get('features'));
    }
    this.exportService
      .export(olFeatures, data.format, layer.title, this.map.projection)
      .subscribe(
        () => {},
        (error: Error) => this.onFileExportError(error),
        () => {
          this.loading$.next(false);
        }
      );
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      format: ['', [Validators.required]],
      layer: ['', [Validators.required]]
    });
  }

  private onFileImportSuccess(file: File, features: Feature[]) {
    if (!this.config.getConfig('importWithStyle')) {
    handleFileImportSuccess(
      file,
      features,
      this.map,
      this.messageService,
      this.languageService
    );
    } else {
      handleFileImportSuccess(
        file,
        features,
        this.map,
        this.messageService,
        this.languageService,
        this.styleListService,
        this.styleService
      );
    }
  }

  private onFileImportError(file: File, error: Error) {
    this.loading$.next(false);
    handleFileImportError(
      file,
      error,
      this.messageService,
      this.languageService
    );
  }

  private onFileExportError(error: Error) {
    this.loading$.next(false);
    handleFileExportError(error, this.messageService, this.languageService);
  }
}

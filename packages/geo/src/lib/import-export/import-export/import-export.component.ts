import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, BehaviorSubject } from 'rxjs';

import { MessageService, LanguageService, ConfigService } from '@igo2/core';
import { strEnum } from '@igo2/utils';

import { Feature } from '../../feature/shared/feature.interfaces';
import { IgoMap } from '../../map/shared/map';
import { ClusterDataSource } from '../../datasource/shared/datasources/cluster-datasource';
import { Layer } from '../../layer/shared/layers/layer';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { AnyLayer } from '../../layer/shared/layers/any-layer';
import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';

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
import { MatTabChangeEvent } from '@angular/material';
import { skipWhile } from 'rxjs/operators';

@Component({
  selector: 'igo-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent implements OnDestroy, OnInit {
  public form: FormGroup;
  public formats$ = new BehaviorSubject(undefined);
  public layers: AnyLayer[];
  public inputProj: string = 'EPSG:4326';
  public loading$ = new BehaviorSubject(false);
  public forceNaming = false;

  private layers$$: Subscription;
  private form$$: Subscription;
  private formats$$: Subscription;
  private formLayer$$: Subscription;
  private exportOptions$$: Subscription;

  private espgCodeRegex = new RegExp('^\\d{4,6}');
  private clientSideFileSizeMax: number;
  public fileSizeMb: number;

  @Input() map: IgoMap;

  @Input() selectedIndex: number = 0;

  @Output() selectedTabIndex = new EventEmitter<number>();

  @Input() exportOptions$: BehaviorSubject<ExportOptions> = new BehaviorSubject(undefined);

  @Output() exportOptionsChange = new EventEmitter<ExportOptions>();

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
    this.loadConfig();
    this.buildForm();
  }

  ngOnInit() {
    this.layers$$ = this.map.layers$.subscribe(layers => {
      this.layers = layers.filter((layer: Layer) => {
        return (layer instanceof VectorLayer && layer.exportable === true) ||
          (layer.dataSource.options.download && layer.dataSource.options.download.url);
      }) as AnyLayer[];
    });
    const configFileSizeMb = this.config.getConfig(
      'importExport.clientSideFileSizeMaxMb'
    );
    this.clientSideFileSizeMax =
      (configFileSizeMb ? configFileSizeMb : 30) * Math.pow(1024, 2);
    this.fileSizeMb = this.clientSideFileSizeMax / Math.pow(1024, 2);

    this.exportOptions$$ = this.exportOptions$
      .pipe(skipWhile(exportOptions => !exportOptions))
      .subscribe((exportOptions) => {
        this.form.patchValue(exportOptions, { emitEvent: false });
      });

    this.form$$ = this.form.valueChanges.subscribe(() => {
      this.exportOptionsChange.emit(this.form.value);
    });

    this.formLayer$$ = this.form.get('layer').valueChanges.subscribe((layerId) => {
      this.computeFormats(this.map.getLayerById(layerId));
    });

    this.formats$$ = this.formats$
      .pipe(skipWhile(formats => !formats))
      .subscribe(formats => {
        if (Object.keys(formats).length === 1) {
          this.form.patchValue({ format: formats[Object.keys(formats)[0]] });
        }
      });
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
    this.form$$.unsubscribe();
    this.formats$$.unsubscribe();
    this.formLayer$$.unsubscribe();
    if (this.exportOptions$$) {
      this.exportOptions$$.unsubscribe();
    }
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
    let filename = layer.title;
    if (data.name !== undefined) {
      filename = data.name;
    }
    const dSOptions: DataSourceOptions = layer.dataSource.options;
    if (data.format === ExportFormat.URL && dSOptions.download && dSOptions.download.url) {
      window.open(dSOptions.download.url, '_blank');
      this.loading$.next(false);
      return;
    }

    let olFeatures;
    if (data.featureInMapExtent) {
      olFeatures = layer.dataSource.ol.getFeaturesInExtent(layer.map.viewController.getExtent());
    } else {
      olFeatures = layer.dataSource.ol.getFeatures();
    }
    if (layer.dataSource instanceof ClusterDataSource) {
      olFeatures = olFeatures.flatMap((cluster: any) =>
        cluster.get('features')
      );
    }
    this.exportService
      .export(olFeatures, data.format, filename, this.map.projection)
      .subscribe(
        () => {},
        (error: Error) => this.onFileExportError(error),
        () => {
          this.loading$.next(false);
        }
      );
  }

  private buildForm() {
    if (this.forceNaming) {
      this.form = this.formBuilder.group({
        format: ['', [Validators.required]],
        layer: ['', [Validators.required]],
        featureInMapExtent: [false, [Validators.required]],
        name: ['', [Validators.required]]
      });
    } else {
      this.form = this.formBuilder.group({
        format: ['', [Validators.required]],
        layer: ['', [Validators.required]],
        featureInMapExtent: [false, [Validators.required]]
      });
    }
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
      this.languageService,
      this.fileSizeMb
    );
  }

  private onFileExportError(error: Error) {
    this.loading$.next(false);
    handleFileExportError(error, this.messageService, this.languageService);
  }

  private loadConfig() {
    if (this.config.getConfig('importExport.forceNaming') !== undefined) {
      this.forceNaming = this.config.getConfig('importExport.forceNaming');
    }
    this.computeFormats();
  }

  private computeFormats(layer?: AnyLayer) {
    if (layer) {
      if (!(layer instanceof VectorLayer) && layer.dataSource.options.download && layer.dataSource.options.download.url) {
        // only url key
        this.formats$.next(strEnum(['URL']));
      } else if (layer.dataSource.options.download && layer.dataSource.options.download.url) {
        // add/keep url key
        this.computeFormats(); // reset
        if (!(ExportFormat.URL in this.formats$.value)) {
          const keys = Object.keys(this.formats$.value);
          keys.push('URL');
          this.formats$.next(strEnum(keys));
        }
      } else if (layer instanceof VectorLayer) {
        // remove url key
        this.computeFormats(); // reset
        if (ExportFormat.URL in this.formats$.value) {
          const keys = Object.keys(this.formats$.value).filter(key => key !== 'URL');
          this.formats$.next(strEnum(keys));
        }
      }
      return;
    }

    if (this.config.getConfig('importExport.formats') !== undefined) {
      const validatedListFormat = this.validateListFormat(
        this.config.getConfig('importExport.formats')
      );
      this.formats$.next(strEnum(validatedListFormat));
    } else {
      this.formats$.next(ExportFormat);
    }
  }

  private validateListFormat(formats: string[]): string[] {
    return formats
      .filter(format => {
        if (
          format.toUpperCase() === ExportFormat.CSV.toUpperCase() ||
          format.toUpperCase() === ExportFormat.GML.toUpperCase() ||
          format.toUpperCase() === ExportFormat.GPX.toUpperCase() ||
          format.toUpperCase() === ExportFormat.GeoJSON.toUpperCase() ||
          format.toUpperCase() === ExportFormat.KML.toUpperCase() ||
          format.toUpperCase() === ExportFormat.Shapefile.toUpperCase() ||
          format.toUpperCase() === ExportFormat.URL.toUpperCase()
        ) {
          return format;
        }
      })
      .map(format => {
        if (format.toUpperCase() === ExportFormat.CSV.toUpperCase()) {
          format = ExportFormat.CSV;
          return format;
        }
        if (format.toUpperCase() === ExportFormat.GML.toUpperCase()) {
          format = ExportFormat.GML;
          return format;
        }
        if (format.toUpperCase() === ExportFormat.GPX.toUpperCase()) {
          format = ExportFormat.GPX;
          return format;
        }
        if (format.toUpperCase() === ExportFormat.GeoJSON.toUpperCase()) {
          format = ExportFormat.GeoJSON;
          return format;
        }
        if (format.toUpperCase() === ExportFormat.KML.toUpperCase()) {
          format = ExportFormat.KML;
          return format;
        }
        if (format.toUpperCase() === ExportFormat.Shapefile.toUpperCase()) {
          format = ExportFormat.Shapefile;
          return format;
        }

        if (format.toUpperCase() === ExportFormat.URL.toUpperCase()) {
          format = ExportFormat.URL;
          return format;
        }
      });
  }

  public tabChanged(tab: MatTabChangeEvent) {
    this.selectedTabIndex.emit(tab.index);
  }
}

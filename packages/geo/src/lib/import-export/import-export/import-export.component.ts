import { AsyncPipe, NgClass } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  model,
  output
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  MatSlideToggleChange,
  MatSlideToggleModule
} from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfirmDialogService } from '@igo2/common/confirm-dialog';
import { CustomHtmlComponent } from '@igo2/common/custom-html';
import { EntityRecord } from '@igo2/common/entity';
import { SpinnerComponent } from '@igo2/common/spinner';
import type { WorkspaceStore } from '@igo2/common/workspace';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { StorageService } from '@igo2/core/storage';

import type { default as OlFeature } from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import olPoint from 'ol/geom/Point';

import { BehaviorSubject, Subscription, lastValueFrom } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';
import { DownloadService } from '../../download/shared/download.service';
import { Feature } from '../../feature/shared/feature.interfaces';
import { LayerId, isLayerGroup, isLayerItem } from '../../layer';
import { LayerService } from '../../layer/shared/layer.service';
import { AnyLayer } from '../../layer/shared/layers/any-layer';
import { Layer } from '../../layer/shared/layers/layer';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { InputProjections, ProjectionsLimitationsOptions } from '../../map/';
import { IgoMap } from '../../map/shared/map';
import { StyleListService } from '../../style/style-list/style-list.service';
import { StyleService } from '../../style/style-service/style.service';
import {
  ExportOptions,
  GeometryCollection,
  RADIUS_NAME
} from '../shared/export.interface';
import { ExportService } from '../shared/export.service';
import {
  AnyExportFormat,
  CsvSeparator,
  ExportFormat,
  ExportFormatLegacy
} from '../shared/export.type';
import {
  handleFileExportError,
  handleFileExportSuccess,
  isCsvExport
} from '../shared/export.utils';
import { ImportExportServiceOptions } from '../shared/import.interface';
import { ImportService } from '../shared/import.service';
import {
  handleFileImportError,
  handleFileImportSuccess
} from '../shared/import.utils';

type SelectMode = 'import' | 'export';
@Component({
  selector: 'igo-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss'],
  imports: [
    MatButtonToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    MatButtonModule,
    SpinnerComponent,
    CustomHtmlComponent,
    NgClass,
    MatSlideToggleModule,
    MatInputModule,
    AsyncPipe,
    IgoLanguageModule
  ],
  providers: [ConfirmDialogService]
})
export class ImportExportComponent implements OnDestroy, OnInit {
  private importService = inject(ImportService);
  private exportService = inject(ExportService);
  private languageService = inject(LanguageService);
  private messageService = inject(MessageService);
  private styleListService = inject(StyleListService);
  private styleService = inject(StyleService);
  private formBuilder = inject(UntypedFormBuilder);
  private config = inject(ConfigService);
  private storageService = inject(StorageService);
  private downloadService = inject(DownloadService);
  private layerService = inject(LayerService);
  private confirmDialogService = inject(ConfirmDialogService);

  public form: UntypedFormGroup;
  public importForm: UntypedFormGroup;
  public formats$ = new BehaviorSubject<ExportFormat[]>(undefined);
  public exportableLayers$ = new BehaviorSubject<Layer[]>([]);
  public loading$ = new BehaviorSubject(false);
  public forceNaming = false;
  public controlFormat = 'format';

  csvSeparators = CsvSeparator;
  isCsvExport = isCsvExport;

  private layers$$: Subscription;
  private exportableLayers$$: Subscription;
  private formats$$: Subscription;
  private formLayer$$: Subscription;
  private exportOptions$$: Subscription;

  public importHtmlClarifications: string;
  public exportHtmlClarifications: string;

  private espgCodeRegex = new RegExp('^\\d{4,6}');
  private clientSideFileSizeMax: number;
  public fileSizeMb: number;

  public projections$: BehaviorSubject<InputProjections[]> =
    new BehaviorSubject([]);

  public popupChecked = false;
  private configFormats: AnyExportFormat[];

  private previousLayerSpecs$ = new BehaviorSubject<
    {
      id: LayerId;
      visible: boolean;
      opacity: number;
      queryable: boolean;
    }[]
  >(undefined);

  readonly selectFirstProj = input(false);

  readonly map = input<IgoMap>(undefined);

  readonly contextUri = input<string>(undefined);
  readonly projectionsLimitations =
    input<ProjectionsLimitationsOptions>(undefined);

  /**
   * Store that holds the available workspaces.
   */
  readonly store = input<WorkspaceStore>(undefined);

  readonly selectedMode = model<SelectMode>('import');

  readonly selectMode = output<SelectMode>();

  readonly exportOptions$ = input(
    new BehaviorSubject<ExportOptions>(undefined)
  );

  readonly exportOptionsChange = output<ExportOptions>();

  get layers() {
    return this.form.get('layers').value;
  }
  set layers(value) {
    this.form.patchValue({ layers: value });
  }

  get inputProj() {
    return this.importForm.get('inputProj').value;
  }
  set inputProj(value) {
    this.importForm.patchValue({ inputProj: value });
  }

  get popupAllowed(): boolean {
    return (
      (this.storageService.get('importExportPopupAllowed') as boolean) || false
    );
  }

  set popupAllowed(value: boolean) {
    this.storageService.set('importExportPopupAllowed', value);
  }

  constructor() {
    this.loadConfig();
    this.buildForm();
    this.importHtmlClarifications = this.languageService.translate.instant(
      'igo.geo.importExportForm.importHtmlClarifications'
    );
    this.exportHtmlClarifications = this.languageService.translate.instant(
      'igo.geo.importExportForm.exportHtmlClarifications'
    );
  }

  ngOnInit() {
    const projections = this.importService.computeProjections(
      this.projectionsLimitations() ?? {}
    );
    this.projections$.next(projections);

    this.layers$$ = this.map().layerController.all$.subscribe((layers) => {
      const exportableLayers = layers.filter((layer) => {
        if (isLayerGroup(layer)) {
          return false;
        }
        return (
          (layer instanceof VectorLayer && layer.exportable === true) ||
          (layer.dataSource.options.download &&
            layer.dataSource.options.download.url)
        );
      });
      this.exportableLayers$.next(exportableLayers as Layer[]);
    });
    const configFileSizeMb = this.config.getConfig(
      'importExport.clientSideFileSizeMaxMb'
    );
    this.clientSideFileSizeMax =
      (configFileSizeMb ? configFileSizeMb : 30) * Math.pow(1024, 2);
    this.fileSizeMb = this.clientSideFileSizeMax / Math.pow(1024, 2);

    this.exportOptions$$ = this.exportOptions$()
      .pipe(skipWhile((exportOptions) => !exportOptions))
      .subscribe((exportOptions) => {
        this.form.patchValue(exportOptions, { emitEvent: true });
        if (exportOptions.layers) {
          this.computeFormats(
            exportOptions.layers.map((l) =>
              this.map().layerController.getById(l)
            )
          );
        }
      });
    this.formLayer$$ = this.form
      .get('format')
      .valueChanges.subscribe((format) => {
        if (
          !this.popupChecked &&
          this.form.get('layers').value?.length > 1 &&
          this.isOgreOrLink(format)
        ) {
          if (!this.handlePopup(true)) {
            this.form.patchValue({ format: undefined }, { emitEvent: false });
          }
        }
      });

    this.formLayer$$ = this.form
      .get('layers')
      .valueChanges.subscribe((layersId) => {
        this.handlePreviousLayerSpecs();
        const selectedLayers =
          layersId instanceof Array ? layersId : [layersId];
        this.form.patchValue({ layers: selectedLayers }, { emitEvent: false });
        const layers = selectedLayers.map((l) =>
          this.map().layerController.getById(l)
        );
        this.computeFormats(layers);

        if (this.formats$.value.indexOf(this.form.value.format) === -1) {
          this.form.patchValue({ format: undefined });
        }

        this.loading$.next(true);
        const previousSpecs: {
          id: LayerId;
          visible: boolean;
          opacity: number;
          queryable: boolean;
        }[] = [];
        layers.forEach((layer) => {
          if (
            layer instanceof VectorLayer &&
            layer.dataSource.ol.getFeatures().length === 0
          ) {
            previousSpecs.push({
              id: layer.id,
              visible: layer.visible,
              opacity: layer.opacity,
              queryable: (layer as any).queryable
            });
            layer.opacity = 0;
            layer.visible = true;
          }
        });

        this.previousLayerSpecs$.next(previousSpecs);
        setTimeout(() => {
          this.loading$.next(false);
        }, 500);
      });

    this.formats$$ = this.formats$
      .pipe(skipWhile((formats) => !formats))
      .subscribe((formats) => {
        if (formats.length === 1) {
          this.form.patchValue({ format: formats[0] });
        }
      });

    this.exportableLayers$$ = this.exportableLayers$
      .pipe(skipWhile((layers) => !layers))
      .subscribe((layers) => {
        if (layers.length === 1) {
          this.form.patchValue({ layers: layers[0].id });
        }
      });

    if (this.selectFirstProj()) {
      if (this.projections$.value.length === 0) {
        this.importForm.patchValue({
          inputProj: {
            translateKey: 'nad83',
            alias: 'NAD83',
            code: 'EPSG:4326',
            zone: ''
          }
        });
      } else {
        this.importForm.patchValue({ inputProj: this.projections$.value[0] });
      }
    } else {
      this.importForm.patchValue({ inputProj: undefined });
    }
  }

  public getLayerTitleById(id): string {
    return this.map().layerController.getById(id)?.title;
  }

  layerHasSelectedFeatures(layer: Layer): boolean {
    const wksFromLayer = this.exportService.getWorkspaceByLayerId(
      layer.id,
      this.store()
    );
    if (wksFromLayer) {
      const recs = wksFromLayer.entityStore.stateView.firstBy(
        (record: EntityRecord<Feature>) => {
          return record.state.selected === true;
        }
      );
      return recs ? true : false;
    }
  }

  public onlySelected(event: MatSlideToggleChange, id: LayerId) {
    let layersWithSelection = this.form.value.layersWithSelection;
    if (event.checked) {
      layersWithSelection.push(id);
    } else {
      layersWithSelection = layersWithSelection.filter(
        (layerId) => layerId !== id
      );
    }
    this.form.patchValue({ layersWithSelection });
  }

  public onlySelectedClick(event, id: LayerId) {
    if (this.form.value.layers.find((layerId) => layerId === id)) {
      event.stopPropagation();
    }
  }

  public inLayersIdToExportSelectionOnly(layer: Layer): boolean {
    return this.form.value.layersWithSelection.find(
      (layerId) => layerId === layer.id
    )
      ? true
      : false;
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
    this.exportableLayers$$.unsubscribe();
    this.formats$$.unsubscribe();
    this.formLayer$$.unsubscribe();
    if (this.exportOptions$$) {
      this.exportOptions$$.unsubscribe();
    }
    this.exportOptionsChange.emit(this.form.value);
    this.handlePreviousLayerSpecs();
  }

  private handlePreviousLayerSpecs() {
    const previousSpecs = this.previousLayerSpecs$.value;
    if (previousSpecs && previousSpecs.length) {
      previousSpecs.forEach((specs) => {
        const previousLayer = this.map().layerController.getById(specs.id);
        previousLayer.visible = specs.visible;
        previousLayer.opacity = specs.opacity;
        (previousLayer as any).queryable = specs.queryable;
      });
    }
    this.previousLayerSpecs$.next(undefined);
  }

  importFiles(files: File[]) {
    let inputProj = this.inputProj.code;
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

  handlePopup(preCheck = true): boolean {
    const p1 = window.open('', 'popup', 'width=1, height=1');
    p1.close();
    const p2 = window.open('', 'popup', 'width=1, height=1');
    if (!p2 || p2.closed || typeof p2.closed === 'undefined' || p2 === null) {
      this.onPopupBlockedError(preCheck);
      this.popupAllowed = false;
    } else {
      p2.close();
      this.popupAllowed = true;
      this.popupChecked = true;
    }
    return this.popupAllowed;
  }

  private isOgreOrLink(format: AnyExportFormat | null): boolean {
    const ogreFormats = Object.keys(ExportService.ogreFormats);
    return ogreFormats.indexOf(format) >= 0 || format === 'URL';
  }

  async handleExportFormSubmit(data: ExportOptions) {
    this.loading$.next(true);

    if (
      !this.popupChecked &&
      data.layers.length > 1 &&
      this.isOgreOrLink(data.format) &&
      !this.popupAllowed
    ) {
      this.handlePopup();
    }

    const isCSV = isCsvExport(data.format);

    if (data.format === 'Excel') {
      try {
        await this.exportService.exportExcel(this.map(), this.store(), data);
        this.loading$.next(false);
        return this.onFileExportSuccess();
      } catch (error) {
        this.onFileExportError(error);
        throw error;
      }
    }

    let fileName = '';

    for (const layerId of data.layers) {
      this.loading$.next(true);
      const layer = this.map().layerController.getById(layerId);
      if (isLayerGroup(layer)) {
        continue;
      }
      const features = await lastValueFrom(
        this.exportService.getFeatures(this.map(), layer, data, this.store())
      ).catch((error) => {
        this.onFileExportError(error);
        throw error;
      });
      const transformedFeatures =
        await this.exportService.transformFeaturesToExportFormat(
          features,
          layer
        );

      const geomTypes = this.exportService.getGeomTypes(
        transformedFeatures,
        data.format
      );
      if (!isCSV || !data.combineLayers || data.layers.length === 1) {
        fileName = layer.title;
        if (data.name) {
          fileName = data.name;
        }
      } else {
        fileName = this.languageService.translate.instant(
          'igo.geo.export.combinedLayers'
        );
      }

      if (data.format === 'URL' && isLayerItem(layer)) {
        this.handleUrlExport(layer);
      }

      if (data.format === 'GPX') {
        this.validateGpxExport(geomTypes);
      }

      if (geomTypes.length === 0) {
        this.loading$.next(false);
        this.messageService.error(
          'igo.geo.export.nothing.text',
          'igo.geo.export.nothing.title',
          { timeOut: 20000 }
        );
      }

      if (!isCSV || !data.combineLayers) {
        geomTypes.forEach((geomType) => {
          if (geomType.type) {
            fileName += geomType.type;
          }
          this.handleExport(geomType.features, data, fileName);
        });
      }
      this.loading$.next(false);
    }

    if (isCSV) {
      this.handleCsvExport(data, fileName);
    }
  }

  private handleUrlExport(layer: Layer): void {
    const { download = null }: DataSourceOptions = layer.dataSource.options;
    if (download?.url || download?.dynamicUrl) {
      setTimeout(() => {
        const url = download.url ?? download.dynamicUrl;
        url.match(/service=wfs/gi)
          ? this.downloadService.open(layer)
          : window.open(url, '_blank');
        this.loading$.next(false);
      }, 500);
      return;
    }
  }

  private validateGpxExport(geomTypes: GeometryCollection[]): void {
    const gpxFeatureCnt = geomTypes.length;
    geomTypes = geomTypes.filter((geomType) =>
      ['LineString', 'Point'].includes(geomType.type)
    );
    const gpxFeatureCntPointOrPoly = geomTypes.length;
    if (gpxFeatureCnt > gpxFeatureCntPointOrPoly) {
      this.messageService.error(
        'igo.geo.export.gpx.error.poly.text',
        'igo.geo.export.gpx.error.poly.title',
        { timeOut: 20000 }
      );
    }
  }

  private async handleCsvExport(data: ExportOptions, fileName: string) {
    const featuresCSV = [];

    if (data.combineLayers) {
      let previousFeature = undefined;
      const geomTypes = await this.getAllLayerGeomTypes(data);
      geomTypes.forEach((geomType) => {
        geomType.features.forEach((currentFeature) => {
          if (data.separator) {
            if (previousFeature) {
              if (
                currentFeature.get('_featureStore').layer.options.title !==
                previousFeature.get('_featureStore').layer.options.title
              ) {
                const titleEmptyRows = this.createTitleEmptyRows(
                  previousFeature,
                  currentFeature
                );
                featuresCSV.push(titleEmptyRows[2]);
                featuresCSV.push(titleEmptyRows[0]);
                featuresCSV.push(titleEmptyRows[1]);
              }
            } else {
              const titleEmptyRows = this.createTitleEmptyRows(
                currentFeature,
                currentFeature
              );
              featuresCSV.push(titleEmptyRows[0]);
            }
          }
          featuresCSV.push(currentFeature);
          previousFeature = currentFeature;
        });
      });
    }

    this.handleExport(featuresCSV, data, fileName);
  }

  private handleExport(
    features: OlFeature<OlGeometry>[],
    options: ExportOptions,
    fileName: string
  ) {
    this.exportService
      .export(features, options, fileName, this.map().projectionCode)
      .subscribe({
        error: (error: Error) => this.onFileExportError(error),
        complete: () => {
          this.onFileExportSuccess();

          features.forEach((feature) => {
            this.circleToPoint(feature);
          });

          this.loading$.next(false);
        }
      });
  }

  private async getAllLayerGeomTypes(
    data: ExportOptions
  ): Promise<GeometryCollection[]> {
    return data.layers.reduce(async (typesPromise, layerId) => {
      const types = await typesPromise;
      const layer = this.map().layerController.getById(layerId);
      if (isLayerGroup(layer)) {
        return typesPromise;
      }
      const features = await lastValueFrom(
        this.exportService.getFeatures(this.map(), layer, data, this.store())
      ).catch((error) => {
        this.onFileExportError(error);
        throw error;
      });
      const transformedFeatures =
        await this.exportService.transformFeaturesToExportFormat(
          features,
          layer
        );
      const geomTypes = this.exportService.getGeomTypes(
        transformedFeatures,
        data.format
      );
      return types.concat(geomTypes);
    }, Promise.resolve([]));
  }

  private createTitleEmptyRows(previousFeature, currentFeature) {
    const titleRow = currentFeature.clone();
    const headerRow = currentFeature.clone();
    const emptyRow = currentFeature.clone();
    const previousFeatureKeys: string[] = previousFeature.getKeys();
    let firstKeyPrevious = '';
    for (const key in previousFeatureKeys) {
      if (previousFeatureKeys[key] !== 'geometry') {
        firstKeyPrevious = previousFeatureKeys[key];
        break;
      }
    }

    const currentFeatureKeys: string[] = currentFeature.getKeys();
    let firstKeyCurrent = '';
    for (const key in currentFeatureKeys) {
      if (currentFeatureKeys[key] !== 'geometry') {
        firstKeyCurrent = currentFeatureKeys[key];
        break;
      }
    }
    const allKeys: string[] = currentFeature.getKeys();
    previousFeatureKeys.forEach((previousKey) => {
      if (allKeys.includes(previousKey) && previousKey !== firstKeyPrevious) {
        allKeys.push(previousKey);
      }
    });
    allKeys.unshift(firstKeyPrevious);

    let firstKeyAll = '';
    for (const key in allKeys) {
      if (allKeys[key] !== 'geometry') {
        firstKeyAll = allKeys[key];
        break;
      }
    }
    allKeys.forEach((key) => {
      const sameKeys: boolean =
        previousFeatureKeys.length === currentFeatureKeys.length &&
        previousFeatureKeys.every(
          (value, index) => value === currentFeatureKeys[index]
        );
      if (key === firstKeyAll && !sameKeys) {
        titleRow.set(
          key,
          currentFeature.get('_featureStore').layer.options.title +
            ' ===============>',
          true
        );
        headerRow.set(key, key, true);
        emptyRow.unset(key, true);
      } else if (key === firstKeyAll && sameKeys) {
        titleRow.set(
          key,
          currentFeature.get('_featureStore').layer.options.title,
          true
        );
        headerRow.set(key, key, true);
        emptyRow.unset(key, true);
      } else if (key === firstKeyCurrent) {
        titleRow.set(
          key,
          currentFeature.get('_featureStore').layer.options.title,
          true
        );
        headerRow.set(key, key, true);
        emptyRow.unset(key, true);
      } else if (key !== 'geometry') {
        titleRow.unset(key, true);
        headerRow.set(key, key, true);
        emptyRow.unset(key, true);
      } else {
        titleRow.unset(key, true);
        emptyRow.unset(key, true);
      }

      if (!currentFeatureKeys.includes(key)) {
        headerRow.unset(key, true);
      }
    });
    const titleEmptyRows = [titleRow, headerRow, emptyRow];
    return titleEmptyRows;
  }

  private circleToPoint(feature: OlFeature) {
    const radius: number = feature.get(RADIUS_NAME);

    if (radius) {
      const point = new olPoint([
        feature.get('longitude'),
        feature.get('latitude')
      ]);
      point.transform('EPSG:4326', feature.get('_projection'));
      feature.setGeometry(point);
    }
  }

  private buildForm() {
    this.importForm = this.formBuilder.group({
      inputProj: ['', [Validators.required]]
    });

    const form = this.formBuilder.group({
      format: ['', [Validators.required]],
      layers: [[], [Validators.required]],
      layersWithSelection: [[]],
      combineLayers: [true, [Validators.required]],
      separator: [false, [Validators.required]],
      featureInMapExtent: [false, [Validators.required]]
    });

    if (this.forceNaming) {
      form.addControl('name', new FormControl('', [Validators.required]));
    }

    form
      .get('format')
      .valueChanges.subscribe((format: ExportFormat) =>
        this.handleCsvForm(form, format)
      );

    this.form = form;
  }

  private handleCsvForm(form: FormGroup, format: ExportFormat): void {
    format === 'CSV'
      ? form.addControl(
          'csvSeparator',
          new FormControl('auto', [Validators.required])
        )
      : form.removeControl('csvSeparator');
  }

  private onFileImportSuccess(file: File, features: Feature[]) {
    const importExportOptions = this.config.getConfig(
      'importExport'
    ) as ImportExportServiceOptions;
    const confirmDialogService = importExportOptions?.allowToStoreLayer
      ? this.confirmDialogService
      : undefined;
    if (!importExportOptions?.importWithStyle) {
      handleFileImportSuccess(
        file,
        features,
        this.map(),
        this.contextUri(),
        this.messageService,
        this.layerService,
        confirmDialogService
      );
    } else {
      handleFileImportSuccess(
        file,
        features,
        this.map(),
        this.contextUri(),
        this.messageService,
        this.layerService,
        confirmDialogService,
        this.styleListService,
        this.styleService
      );
    }
  }

  private onFileImportError(file: File, error: Error) {
    this.loading$.next(false);
    handleFileImportError(file, error, this.messageService, this.fileSizeMb);
  }

  private onPopupBlockedError(preCheck = true) {
    this.loading$.next(false);
    const extraMessage = preCheck
      ? 'igo.geo.export.popupBlocked.selectAgain'
      : 'igo.geo.export.popupBlocked.retry';
    this.messageService.error(
      'igo.geo.export.popupBlocked.text',
      'igo.geo.export.popupBlocked.title',
      { timeOut: 20000 },
      { extraMessage }
    );
  }

  private onFileExportError(error: Error) {
    this.loading$.next(false);
    if (error.name === 'maxFieldsSize') {
      this.messageService.error(
        'igo.geo.export.failed.tip',
        'igo.geo.export.failed.title'
      );
      return;
    }
    handleFileExportError(error, this.messageService);
  }

  private loadConfig() {
    const forceNamingConfig = this.config.getConfig('importExport.forceNaming');
    this.forceNaming =
      forceNamingConfig !== undefined ? forceNamingConfig : false;

    this.configFormats = this.config.getConfig('importExport.formats');
    this.computeFormats();
  }

  private computeFormats(layers?: AnyLayer[]) {
    let appliedformats: ExportFormat[] = [...ExportFormat];
    const formatsType = {
      onlyUrl: false,
      onlyVector: false,
      vectorAndUrl: false,
      customList: false
    };
    const customList = [];
    if (layers?.length) {
      layers.forEach((layer) => {
        if (!layer || isLayerGroup(layer)) {
          return;
        }
        if (layer.dataSource.options.download?.allowedFormats) {
          formatsType.customList = true;
          customList.push({
            layer: layer.title,
            formats: this.validateListFormat(
              layer.dataSource.options.download.allowedFormats
            )
          });
        } else if (
          !(layer instanceof VectorLayer) &&
          layer.dataSource.options.download &&
          layer.dataSource.options.download.url
        ) {
          formatsType.onlyUrl = true;
        } else if (
          layer.dataSource.options.download &&
          (layer.dataSource.options.download.url ||
            layer.dataSource.options.download.dynamicUrl)
        ) {
          formatsType.vectorAndUrl = true;
        } else if (layer instanceof VectorLayer) {
          formatsType.onlyVector = true;
        }
      });
      const hasUrl = this.formats$.value.includes('URL');

      if (formatsType.onlyUrl === true && formatsType.onlyVector === false) {
        appliedformats = ['URL'];
      } else if (
        formatsType.onlyVector === true &&
        formatsType.onlyUrl === false
      ) {
        this.computeFormats(); // reset
        if (hasUrl) {
          appliedformats = [...this.formats$.value].filter(
            (key) => key !== 'URL'
          );
        }
      } else if (
        formatsType.vectorAndUrl === true &&
        formatsType.onlyUrl === false &&
        formatsType.onlyVector === false
      ) {
        this.computeFormats(); // reset
        if (!hasUrl) {
          const keys = [...this.formats$.value];
          keys.push('URL');
          appliedformats = keys;
        }
      }
    }

    appliedformats = this.getAvailableFormats(appliedformats);

    if (formatsType.customList) {
      let commonFormats;
      const layersWithCustomFormats = [];
      let previousCustomListFormats = customList[0].formats;
      customList.map((list) => {
        layersWithCustomFormats.push(list.layer);
        commonFormats = list.formats.filter((value) =>
          previousCustomListFormats.includes(value)
        );
        previousCustomListFormats = list.formats;
      });
      const finalFormats = commonFormats.filter((value) =>
        appliedformats.includes(value)
      );
      if (finalFormats.length > 0) {
        this.formats$.next(finalFormats);

        if (layers && layers.length) {
          if (layers.length > 1) {
            this.messageService.alert(
              'igo.geo.export.customList.text',
              'igo.geo.export.customList.title',
              undefined,
              { value: layersWithCustomFormats.join() }
            );
          }
        }
      } else {
        this.formats$.next([]);
        this.messageService.alert(
          'igo.geo.export.noFormat.text',
          'igo.geo.export.noFormat.title'
        );
      }
      return;
    } else {
      this.formats$.next(appliedformats);
    }
  }

  private getAvailableFormats(layerFormats: ExportFormat[]): ExportFormat[] {
    if (!this.configFormats) {
      return layerFormats;
    }
    const availableFormats = this.validateListFormat(this.configFormats);
    return layerFormats.filter((layerFormat) =>
      availableFormats.includes(layerFormat)
    );
  }

  private validateListFormat(formats: AnyExportFormat[]): ExportFormat[] {
    const allUppercaseFormats = [...ExportFormat, ...ExportFormatLegacy].map(
      (f) => f.toUpperCase()
    );

    return formats
      .filter((format) => {
        if (allUppercaseFormats.includes(format.toUpperCase())) {
          return format;
        }
      })
      .map((format) => {
        const csvFormats: string[] = (
          ['CSV', 'CSVcomma', 'CSVsemicolon'] satisfies AnyExportFormat[]
        ).map((f) => f.toUpperCase());
        if (csvFormats.includes(format.toUpperCase())) {
          return 'CSV';
        } else if (this.compareString<ExportFormat>('Excel', format)) {
          return 'Excel';
        } else if (this.compareString<ExportFormat>('GML', format)) {
          return 'GML';
        } else if (this.compareString<ExportFormat>('GPX', format)) {
          return 'GPX';
        } else if (this.compareString<ExportFormat>('GeoJSON', format)) {
          return 'GeoJSON';
        } else if (this.compareString<ExportFormat>('KML', format)) {
          return 'KML';
        } else if (this.compareString<ExportFormat>('Shapefile', format)) {
          return 'Shapefile';
        } else if (this.compareString<ExportFormat>('URL', format)) {
          return 'URL';
        }
      });
  }

  private compareString<T extends string>(value1: T, value2: string): boolean {
    return value1.toUpperCase() === value2.toUpperCase();
  }

  public modeChanged(mode: SelectMode) {
    this.selectMode.emit(mode);
  }

  private onFileExportSuccess() {
    handleFileExportSuccess(this.messageService);
  }

  onImportExportChange(event) {
    this.selectedMode.set(event.value);
  }
}

import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription, BehaviorSubject } from 'rxjs';

import {
  MessageService,
  LanguageService,
  ConfigService,
  StorageService
} from '@igo2/core';
import { strEnum } from '@igo2/utils';

import { Feature } from '../../feature/shared/feature.interfaces';
import { IgoMap } from '../../map/shared/map';
import { ClusterDataSource } from '../../datasource/shared/datasources/cluster-datasource';
import { Layer } from '../../layer/shared/layers/layer';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { AnyLayer } from '../../layer/shared/layers/any-layer';
import { DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';
import olPoint from 'ol/geom/Point';
import { circular } from 'ol/geom/Polygon';

import {
  handleFileExportError,
  handleFileExportSuccess
} from '../shared/export.utils';
import { ExportOptions } from '../shared/export.interface';
import { ExportFormat, EncodingFormat } from '../shared/export.type';
import { ExportService } from '../shared/export.service';
import { ImportService } from '../shared/import.service';
import {
  handleFileImportSuccess,
  handleFileImportError
} from '../shared/import.utils';
import { StyleService } from '../../style/style-service/style.service';
import { StyleListService } from '../../style/style-list/style-list.service';
import { skipWhile } from 'rxjs/operators';
import { EntityRecord, Workspace } from '@igo2/common';
import type { WorkspaceStore } from '@igo2/common';
import { WfsWorkspace } from '../../workspace/shared/wfs-workspace';
import { EditionWorkspace } from '../../workspace/shared/edition-workspace';
import { FeatureWorkspace } from '../../workspace/shared/feature-workspace';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { InputProjections, ProjectionsLimitationsOptions } from '../../map/';
import { DownloadService } from '../../download/shared/download.service';
import { computeProjectionsConstraints } from '../../map';

import olVectorSource from 'ol/source/Vector';
import olClusterSource from 'ol/source/Cluster';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { ImportExportServiceOptions } from '../shared/import.interface';

@Component({
  selector: 'igo-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent implements OnDestroy, OnInit {
  public form: UntypedFormGroup;
  public importForm: UntypedFormGroup;
  public formats$ = new BehaviorSubject(undefined);
  public encodings$ = new BehaviorSubject(undefined);
  public exportableLayers$: BehaviorSubject<AnyLayer[]> = new BehaviorSubject(
    []
  );
  public loading$ = new BehaviorSubject(false);
  public forceNaming = false;
  public controlFormat = 'format';

  private layers$$: Subscription;
  private exportableLayers$$: Subscription;
  private formats$$: Subscription;
  private encodings$$: Subscription;
  private formLayer$$: Subscription;
  private exportOptions$$: Subscription;

  public importHtmlClarifications: string;
  public exportHtmlClarifications: string;

  private espgCodeRegex = new RegExp('^\\d{4,6}');
  private clientSideFileSizeMax: number;
  public fileSizeMb: number;

  public projections$: BehaviorSubject<InputProjections[]> = new BehaviorSubject([]);
  private projectionsConstraints: ProjectionsLimitationsOptions;

  public popupChecked: boolean = false;

  private previousLayerSpecs$: BehaviorSubject<
    {
      id: string;
      visible: boolean;
      opacity: number;
      queryable: boolean;
    }[]
  > = new BehaviorSubject(undefined);

  @Input() selectFirstProj: boolean = false;

  @Input() map: IgoMap;

  private _projectionsLimitations: ProjectionsLimitationsOptions = {};
  @Input()
  set projectionsLimitations(value: ProjectionsLimitationsOptions) {
    this._projectionsLimitations = value;
    this.computeProjections();
  }
  get projectionsLimitations(): ProjectionsLimitationsOptions {
    return this._projectionsLimitations || {};
  }

  /**
   * Store that holds the available workspaces.
   */
  @Input() store: WorkspaceStore;

  @Input() selectedMode = 'import';

  @Output() selectMode = new EventEmitter<string>();

  @Input() exportOptions$: BehaviorSubject<ExportOptions> = new BehaviorSubject(
    undefined
  );

  @Output() exportOptionsChange = new EventEmitter<ExportOptions>();

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
    return this.storageService.get('importExportPopupAllowed') as boolean || false;
  }

  set popupAllowed(value: boolean) {
    this.storageService.set('importExportPopupAllowed', value);
  }

  constructor(
    private importService: ImportService,
    private exportService: ExportService,
    private languageService: LanguageService,
    private messageService: MessageService,
    private styleListService: StyleListService,
    private styleService: StyleService,
    private formBuilder: UntypedFormBuilder,
    private config: ConfigService,
    private cdRef: ChangeDetectorRef,
    private storageService: StorageService,
    private downloadService: DownloadService
  ) {
    this.loadConfig();
    this.buildForm();
    this.computeProjections();
    this.importHtmlClarifications = this.languageService.translate.instant('igo.geo.importExportForm.importHtmlClarifications');
    this.exportHtmlClarifications = this.languageService.translate.instant('igo.geo.importExportForm.exportHtmlClarifications');
  }

  ngOnInit() {
    this.layers$$ = this.map.layers$.subscribe((layers) => {
      this.exportableLayers$.next(
        layers.filter((layer: Layer) => {
          return (
            (layer instanceof VectorLayer && layer.exportable === true) ||
            (layer.dataSource.options.download &&
              layer.dataSource.options.download.url)
          );
        }) as AnyLayer[]
      );
    });
    const configFileSizeMb = this.config.getConfig(
      'importExport.clientSideFileSizeMaxMb'
    );
    this.clientSideFileSizeMax =
      (configFileSizeMb ? configFileSizeMb : 30) * Math.pow(1024, 2);
    this.fileSizeMb = this.clientSideFileSizeMax / Math.pow(1024, 2);

    this.exportOptions$$ = this.exportOptions$
      .pipe(skipWhile((exportOptions) => !exportOptions))
      .subscribe((exportOptions) => {
        this.form.patchValue(exportOptions, { emitEvent: true });
        if (exportOptions.layers) {
          this.computeFormats(
            exportOptions.layers.map((l) => this.map.getLayerById(l))
          );
        }
      });
    this.formLayer$$ = this.form
      .get('format')
      .valueChanges
      .subscribe((format) => {
        const ogreFormats = Object.keys(ExportService.ogreFormats);
        if (
          !this.popupChecked &&
          this.form.get('layers').value?.length > 1 &&
          (ogreFormats.indexOf(format) >= 0 || format === ExportFormat.URL)) {
          if (!this.handlePopup(true)) {
            this.form.patchValue({ format: undefined }, { emitEvent: false });
          }
        }
      });

    this.formLayer$$ = this.form
      .get('layers')
      .valueChanges.subscribe((layersId) => {
        this.handlePreviousLayerSpecs();
        const selectedLayers = layersId instanceof Array ? layersId : [layersId];
        this.form.patchValue({ layers: selectedLayers }, { emitEvent: false });
        const layers = selectedLayers.map((l) => this.map.getLayerById(l));
        this.computeFormats(layers);

        if (
          Object.keys(this.formats$.value).indexOf(this.form.value.format) ===
          -1
        ) {
          this.form.patchValue({ format: undefined });
        }

        this.loading$.next(true);
        const previousSpecs: {
          id: string;
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
        if (Object.keys(formats).length === 1) {
          this.form.patchValue({ format: formats[Object.keys(formats)[0]] });
        }
      });

    this.encodings$$ = this.encodings$
      .pipe(skipWhile((encodings) => !encodings))
      .subscribe((encodings) => {
        if (Object.keys(encodings).length === 1) {
          this.form.patchValue({ encoding: encodings[Object.keys(encodings)[0]] });
        }
      });

    this.exportableLayers$$ = this.exportableLayers$
      .pipe(skipWhile((layers) => !layers))
      .subscribe((layers) => {
        if (layers.length === 1) {
          this.form.patchValue({ layers: layers[0].id });
        }
      });

    this.form.controls[this.controlFormat].valueChanges.subscribe((format) => {
      if (format === ExportFormat.CSVcomma || format === ExportFormat.CSVsemicolon) {
        this.form.patchValue({ encoding: EncodingFormat.LATIN1 });
      } else {
        this.form.patchValue({ encoding: EncodingFormat.UTF8 });
      }
      this.cdRef.detectChanges();
    });

    if (this.selectFirstProj) {
      if (this.projections$.value.length === 0) {
        this.importForm.patchValue({ inputProj: { translateKey: 'nad83', alias: 'NAD83', code: 'EPSG:4326', zone: '' } });
      } else {
        this.importForm.patchValue({ inputProj: this.projections$.value[0] });
      }
    } else {
      this.importForm.patchValue({ inputProj: undefined });
    }
  }

  private computeProjections() {
    this.projectionsConstraints = computeProjectionsConstraints(this.projectionsLimitations);
    const projections: InputProjections[] = [];

    if (this.projectionsConstraints.nad83) {
      projections.push({ translateKey: 'nad83', alias: 'NAD83', code: 'EPSG:4269', zone: '' });
    }
    if (this.projectionsConstraints.wgs84) {
      projections.push({ translateKey: 'wgs84', alias: 'WGS84', code: 'EPSG:4326', zone: '' });
    }
    if (this.projectionsConstraints.webMercator) {
      projections.push({ translateKey: 'webMercator', alias: 'Web Mercator', code: 'EPSG:3857', zone: '' });
    }

    if (this.projectionsConstraints.mtm) {
      // all mtm zones
      const minZone = this.projectionsConstraints.mtmZone.minZone;
      const maxZone = this.projectionsConstraints.mtmZone.maxZone;

      for (let mtmZone = minZone; mtmZone <= maxZone; mtmZone++) {
        const code = mtmZone < 10 ? `EPSG:3218${mtmZone}` : `EPSG:321${80 + mtmZone}`;
        projections.push({ translateKey: 'mtm', alias: `MTM ${mtmZone}`, code, zone: `${mtmZone}` });
      }
    }

    if (this.projectionsConstraints.utm) {
      // all utm zones
      const minZone = this.projectionsConstraints.utmZone.minZone;
      const maxZone = this.projectionsConstraints.utmZone.maxZone;

      for (let utmZone = minZone; utmZone <= maxZone; utmZone++) {
        const code = utmZone < 10 ? `EPSG:3260${utmZone}` : `EPSG:326${utmZone}`;
        projections.push({ translateKey: 'utm', alias: `UTM ${utmZone}`, code, zone: `${utmZone}` });
      }
    }

    let configProjection = [];
    if (this.projectionsConstraints.projFromConfig) {
      configProjection = this.config.getConfig('projections') || [];
    }

    this.projections$.next(configProjection.concat(projections));
  }

  private getWorkspaceByLayerId(id: string): Workspace {
    const wksFromLayerId = this.store
      .all()
      .find(workspace => (workspace as WfsWorkspace | FeatureWorkspace | EditionWorkspace).layer.id === id);
    if (wksFromLayerId) {
      return wksFromLayerId;
    }
    return;
  }

  public getLayerTitleById(id): string {
    return this.map.getLayerById(id)?.title;
  }


  layerHasSelectedFeatures(layer: Layer): boolean {
    const wksFromLayer = this.getWorkspaceByLayerId(layer.id);
    if (wksFromLayer) {
      const recs = wksFromLayer.entityStore.stateView
        .firstBy((record: EntityRecord<Feature>) => {
          return record.state.selected === true;
        });
      return recs ? true : false;
    }
  }

  public onlySelected(event: MatSlideToggleChange, id: string) {
    let layersWithSelection = this.form.value.layersWithSelection;
    if (event.checked) {
      layersWithSelection.push(id);
    } else {
      layersWithSelection = layersWithSelection.filter(layerId => layerId !== id);
    }
    this.form.patchValue({ layersWithSelection });
  }

  public onlySelectedClick(event, id: string) {
    if (this.form.value.layers.find(layerId => layerId === id)) {
      event.stopPropagation();
    }
  }

  public inLayersIdToExportSelectionOnly(layer: Layer): boolean {
    return this.form.value.layersWithSelection.find(layerId => layerId === layer.id) ? true : false;
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
    this.exportableLayers$$.unsubscribe();
    this.formats$$.unsubscribe();
    this.encodings$$.unsubscribe();
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
        const previousLayer = this.map.getLayerById(specs.id);
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

  handlePopup(preCheck: boolean = true): boolean {
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

  handleExportFormSubmit(data: ExportOptions) {
    this.loading$.next(true);

    const ogreFormats = Object.keys(ExportService.ogreFormats);
    if (!this.popupChecked && data.layers.length > 1 &&
      (ogreFormats.indexOf(data.format) >= 0 || data.format === ExportFormat.URL) && !this.popupAllowed) {
      this.handlePopup();
    }

    let geomTypesCSV: { geometryType: string, features: any[] }[] = [];
    let featuresCSV: any[] = [];
    let filename: string = "";

    for (const [layerIndex, layer] of data.layers.entries()) {
      const lay = this.map.getLayerById(layer);
      if (!(data.format === ExportFormat.CSVsemicolon || data.format === ExportFormat.CSVcomma)
      || !data.combineLayers || data.layers.length === 1) {
        filename = lay.title;
        if (data.name) {
          filename = data.name;
        }
      } else {
        filename = this.languageService.translate.instant('igo.geo.export.combinedLayers');
      }
      const dSOptions: DataSourceOptions = lay.dataSource.options;
      if (data.format === ExportFormat.URL && dSOptions.download && (dSOptions.download.url || dSOptions.download.dynamicUrl)) {
        setTimeout(() => {
          // better look an feel
          const url = dSOptions.download.url || dSOptions.download.dynamicUrl;
          url.match(/service=wfs/gi) ? this.downloadService.open(lay) : window.open(url , '_blank');
          this.loading$.next(false);
        }, 500);
        return;
      }
      const wks = this.getWorkspaceByLayerId(layer);
      let olFeatures;
      if (wks && wks.entityStore && wks.entityStore.stateView.all().length) {

        if (data.layersWithSelection.indexOf(layer) !== -1 && data.featureInMapExtent) {
          // Only export selected feature && into map extent
          olFeatures = wks.entityStore.stateView.all()
            .filter((e: EntityRecord<object>) => e.state.inMapExtent && e.state.selected).map(e => (e.entity as Feature).ol);
        } else if (data.layersWithSelection.indexOf(layer) !== -1 && !data.featureInMapExtent) {
          // Only export selected feature &&  (into map extent OR not)
          olFeatures = wks.entityStore.stateView.all()
            .filter((e: EntityRecord<object>) => e.state.selected).map(e => (e.entity as Feature).ol);
        } else if (data.featureInMapExtent) {
          // Only into map extent
          olFeatures = wks.entityStore.stateView.all()
            .filter((e: EntityRecord<object>) => e.state.inMapExtent).map(e => (e.entity as Feature).ol);
        } else {
          // All features
          olFeatures = wks.entityStore.stateView.all().map(e => (e.entity as Feature).ol);
        }
      }
      else {
        const ol = lay.dataSource.ol as olVectorSource<OlGeometry> | olClusterSource ;
        if (data.featureInMapExtent) {
          olFeatures = ol.getFeaturesInExtent(
            lay.map.viewController.getExtent()
          );
        } else {
          olFeatures = ol.getFeatures();
        }
        if (lay.dataSource instanceof ClusterDataSource) {
          olFeatures = olFeatures.flatMap((cluster: any) =>
            cluster.get('features')
          );
        }
      }


      let geomTypes: { geometryType: string, features: any[] }[] = [];
      if (data.format === ExportFormat.Shapefile || data.format === ExportFormat.GPX) {
        olFeatures.forEach((olFeature) => {
          const featureGeomType = olFeature.getGeometry().getType();
          const currentGeomType = geomTypes.find(geomType => geomType.geometryType === featureGeomType);
          if (currentGeomType) {
            currentGeomType.features.push(olFeature);
          } else {
            geomTypes.push({ geometryType: featureGeomType, features: [olFeature] });
          }
        });
      } else {
        geomTypes = [{ geometryType: '', features: olFeatures }];
      }

      geomTypes.forEach(geomType => {
        geomType.features.forEach(feature => {
          const radius: number = feature.get('rad');
          if (radius) {
            const center4326: Array<number> = [feature.get('longitude'), feature.get('latitude')];
            const circle = circular(center4326, radius, 500);
            circle.transform('EPSG:4326', feature.get('_projection'));
            feature.setGeometry(circle);
          }
        });
      });

      if (data.format === ExportFormat.GPX) {
        const gpxFeatureCnt = geomTypes.length;
        geomTypes = geomTypes.filter(geomType => ['LineString', 'Point'].includes(geomType.geometryType));
        const gpxFeatureCntPointOrPoly = geomTypes.length;
        if (gpxFeatureCnt > gpxFeatureCntPointOrPoly) {
          this.messageService.error('igo.geo.export.gpx.error.poly.text', 'igo.geo.export.gpx.error.poly.title', { timeOut: 20000 });
        }
      } else if ((data.format === ExportFormat.CSVsemicolon || data.format === ExportFormat.CSVcomma) && data.combineLayers) {
        geomTypes.forEach(geomType => geomTypesCSV.push(geomType));

        if (layerIndex !== data.layers.length - 1) {
          continue;
        } else {
          let previousFeature = undefined;
          geomTypesCSV.forEach(geomType => {
            geomType.features.forEach(currentFeature => {
              if (data.separator) {
                if (previousFeature) {
                  if (currentFeature.get('_featureStore').layer.options.title !==
                  previousFeature.get('_featureStore').layer.options.title) {
                    const titleEmptyRows = this.createTitleEmptyRows(previousFeature, currentFeature);
                    featuresCSV.push(titleEmptyRows[2]);
                    featuresCSV.push(titleEmptyRows[0]);
                    featuresCSV.push(titleEmptyRows[1]);
                  }
                } else {
                  const titleEmptyRows = this.createTitleEmptyRows(currentFeature, currentFeature);
                  featuresCSV.push(titleEmptyRows[0]);
                }
              }
              featuresCSV.push(currentFeature);
              previousFeature = currentFeature;
            });
          });
        }
      }

      if (geomTypes.length === 0) {
        this.loading$.next(false);
        this.messageService.error('igo.geo.export.nothing.text', 'igo.geo.export.nothing.title', { timeOut: 20000 });

      } else {
        if (!(data.format === ExportFormat.CSVsemicolon || data.format === ExportFormat.CSVcomma) || !data.combineLayers) {
          geomTypes.map(geomType =>
            this.exportService.export(geomType.features, data.format, filename + geomType.geometryType, data.encoding, this.map.projection)
            .subscribe(
              () => {},
              (error: Error) => this.onFileExportError(error),
              () => {
                this.onFileExportSuccess();

                geomType.features.forEach(feature => {
                  this.circleToPoint(feature);
                });

                this.loading$.next(false);
            }
          ));
        }
      }
    };
    if ((data.format === ExportFormat.CSVsemicolon || data.format === ExportFormat.CSVcomma) && data.combineLayers) {
      this.exportService.export(featuresCSV, data.format, filename, data.encoding, this.map.projection)
      .subscribe(
        () => {},
        (error: Error) => this.onFileExportError(error),
        () => {
          this.onFileExportSuccess();

          featuresCSV.forEach(feature => {
            this.circleToPoint(feature);
          });

          this.loading$.next(false);
        }
      );
    }
  }

  private createTitleEmptyRows(previousFeature, currentFeature) {
    const titleRow = currentFeature.clone();
    const headerRow = currentFeature.clone();
    const emptyRow = currentFeature.clone();
    const previousFeatureKeys: Array<string> = previousFeature.getKeys();
    let firstKeyPrevious: string = '';
    for (const key in previousFeatureKeys) {
      if (previousFeatureKeys[key] !== 'geometry') {
        firstKeyPrevious = previousFeatureKeys[key];
        break;
      }
    }

    const currentFeatureKeys: Array<string> = currentFeature.getKeys();
    let firstKeyCurrent: string = '';
    for (const key in currentFeatureKeys) {
      if (currentFeatureKeys[key] !== 'geometry') {
        firstKeyCurrent = currentFeatureKeys[key];
        break;
      }
    }
    const allKeys: Array<string> = currentFeature.getKeys();
    previousFeatureKeys.forEach(previousKey => {
      if (allKeys.includes(previousKey) && previousKey !== firstKeyPrevious) {
        allKeys.push(previousKey);
      }
    });
    allKeys.unshift(firstKeyPrevious);

    let firstKeyAll: string = '';
    for (const key in allKeys) {
      if (allKeys[key] !== 'geometry') {
        firstKeyAll = allKeys[key];
        break;
      }
    }
    allKeys.forEach(key => {
      const sameKeys: boolean = previousFeatureKeys.length === currentFeatureKeys.length &&
      previousFeatureKeys.every((value, index) => value === currentFeatureKeys[index]);
      if (key === firstKeyAll && !sameKeys) {
        titleRow.set(key, currentFeature.get('_featureStore').layer.options.title + " ===============>", true);
        headerRow.set(key, key, true);
        emptyRow.unset(key, true);
      } else if (key === firstKeyAll && sameKeys) {
        titleRow.set(key, currentFeature.get('_featureStore').layer.options.title, true);
        headerRow.set(key, key, true);
        emptyRow.unset(key, true);
      } else if (key === firstKeyCurrent) {
        titleRow.set(key, currentFeature.get('_featureStore').layer.options.title, true);
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

      if (!(currentFeatureKeys.includes(key))) {
        headerRow.unset(key, true);
      }
    });
    const titleEmptyRows = [titleRow, headerRow, emptyRow];
    return titleEmptyRows;
  }

  private circleToPoint(feature) {
    const radius: number = feature.get('rad');

    if (radius) {
      const point = new olPoint([feature.get('longitude'), feature.get('latitude')]);
      point.transform('EPSG:4326', feature.get('_projection'));
      feature.setGeometry(point);
    }
  }

  private buildForm() {
    this.importForm = this.formBuilder.group({
      inputProj: ['', [Validators.required]]
    });

    if (this.forceNaming) {
      this.form = this.formBuilder.group({
        format: ['', [Validators.required]],
        layers: [[], [Validators.required]],
        layersWithSelection: [[]],
        encoding: [EncodingFormat.UTF8, [Validators.required]],
        combineLayers: [true, [Validators.required]],
        separator: [false, [Validators.required]],
        featureInMapExtent: [false, [Validators.required]],
        name: ['', [Validators.required]]
      });
    } else {
      this.form = this.formBuilder.group({
        format: ['', [Validators.required]],
        layers: [[], [Validators.required]],
        layersWithSelection: [[]],
        encoding: [EncodingFormat.UTF8, [Validators.required]],
        combineLayers: [true, [Validators.required]],
        separator: [false, [Validators.required]],
        featureInMapExtent: [false, [Validators.required]],
      });
    }
  }

  private onFileImportSuccess(file: File, features: Feature[]) {
    const importExportOptions = this.config.getConfig('importExport') as ImportExportServiceOptions;
    const importWithStyle =importExportOptions?.importWithStyle || this.config.getConfig('importWithStyle');
    if (this.config.getConfig('importWithStyle')) {
      console.warn(`
      The location of this config importWithStyle is deprecated.
      Please move this property within importExport configuration.
      Ex: importWithStyle: true/false must be transfered to importExport: { importWithStyle: true/false }
      Refer to environnement.ts OR config/config.json
      This legacy conversion will be deleted in 2024.
      `);
    }
    if (!importWithStyle) {
      handleFileImportSuccess(
        file,
        features,
        this.map,
        this.messageService
      );
    } else {
      handleFileImportSuccess(
        file,
        features,
        this.map,
        this.messageService,
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
      this.fileSizeMb
    );
  }

  private onPopupBlockedError(preCheck: boolean = true) {
    this.loading$.next(false);
    const extraMessage = preCheck ? 'igo.geo.export.popupBlocked.selectAgain' : 'igo.geo.export.popupBlocked.retry';
    this.messageService.error(
      'igo.geo.export.popupBlocked.text',
      'igo.geo.export.popupBlocked.title',
      { timeOut: 20000 },
      {extraMessage});
  }

  private onFileExportError(error: Error) {
    this.loading$.next(false);
    handleFileExportError(error, this.messageService);
  }

  private loadConfig() {
    if (this.config.getConfig('importExport.forceNaming') !== undefined) {
      this.forceNaming = this.config.getConfig('importExport.forceNaming');
    }
    this.computeFormats();
    this.loadEncodings();
  }

  public encodingDefaultValue(format: ExportFormat) {
    if (format === ExportFormat.CSVcomma || format === ExportFormat.CSVsemicolon) {
      this.form.patchValue({ encoding: EncodingFormat.LATIN1 });
      return EncodingFormat.LATIN1;
    } else {
      this.form.patchValue({ encoding: EncodingFormat.UTF8 });
      return EncodingFormat.UTF8;
    }
  }

  private loadEncodings() {
    this.encodings$.next(EncodingFormat);
  }

  private computeFormats(layers?: AnyLayer[]) {
    let appliedformats: string[] = Object.keys(ExportFormat);
    const formatsType = {
      onlyUrl: false,
      onlyVector: false,
      vectorAndUrl: false,
      customList: false
    };
    const customList = [];
    if (layers && layers.length) {
      layers.forEach((layer) => {
        if (!layer) {
          return;
        }
        if (layer.dataSource.options.download?.allowedFormats) {
          formatsType.customList = true;
          customList.push({layer: layer.title, formats: this.validateListFormat(layer.dataSource.options.download.allowedFormats)});
        } else if (
          !(layer instanceof VectorLayer) &&
          layer.dataSource.options.download &&
          layer.dataSource.options.download.url
        ) {
          formatsType.onlyUrl = true;
        } else if (
          layer.dataSource.options.download &&
          (layer.dataSource.options.download.url || layer.dataSource.options.download.dynamicUrl)
        ) {
          formatsType.vectorAndUrl = true;
        } else if (layer instanceof VectorLayer) {
          formatsType.onlyVector = true;
        }
      });

      if (formatsType.onlyUrl === true && formatsType.onlyVector === false) {
        appliedformats = ['URL'];
      } else if (
        formatsType.onlyVector === true &&
        formatsType.onlyUrl === false
      ) {
        this.computeFormats(); // reset
        if (ExportFormat.URL in this.formats$.value) {
          const keys = Object.keys(this.formats$.value).filter(
            (key) => key !== 'URL'
          );
          appliedformats = keys;
        }
      } else if (
        formatsType.vectorAndUrl === true &&
        formatsType.onlyUrl === false &&
        formatsType.onlyVector === false
      ) {
        this.computeFormats(); // reset
        if (!(ExportFormat.URL in this.formats$.value)) {
          const keys = Object.keys(this.formats$.value);
          keys.push('URL');
          appliedformats = keys;
        }
      }
    }
    const configImportExportFormats = this.config.getConfig('importExport.formats');
    if (configImportExportFormats) {
      const validatedListFormat = this.validateListFormat(configImportExportFormats);
      appliedformats = appliedformats.filter(af => validatedListFormat.includes(af));
    }
    if (formatsType.customList) {
      let commonFormats;
      const layersWithCustomFormats = [];
      let previousCustomListFormats = customList[0].formats;
      customList.map(list => {
        layersWithCustomFormats.push(list.layer);
        commonFormats = list.formats.filter(value => previousCustomListFormats.includes(value));
        previousCustomListFormats = list.formats;
      });
      const finalFormats = commonFormats.filter(value => appliedformats.includes(value));
      if (finalFormats.length > 0) {
        this.formats$.next(strEnum(finalFormats));

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
        this.messageService.alert('igo.geo.export.noFormat.text','igo.geo.export.noFormat.title');
      }
      return;
    } else {
      this.formats$.next(strEnum(appliedformats));
    }
  }

  private validateListFormat(formats: string[]): string[] {
    return formats
      .filter((format) => {
        if (
          format.toUpperCase() === ExportFormat.CSVcomma.toUpperCase() ||
          format.toUpperCase() === ExportFormat.CSVsemicolon.toUpperCase() ||
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
      .map((format) => {
        if (format.toUpperCase() === ExportFormat.CSVcomma.toUpperCase()) {
          format = ExportFormat.CSVcomma;
          return format;
        }
        if (format.toUpperCase() === ExportFormat.CSVsemicolon.toUpperCase()) {
          format = ExportFormat.CSVsemicolon;
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

  public modeChanged(mode) {
    this.selectMode.emit(mode);
  }

  private onFileExportSuccess() {
    handleFileExportSuccess(this.messageService);
  }

  onImportExportChange(event) {
    this.selectedMode = event.value;
  }
}

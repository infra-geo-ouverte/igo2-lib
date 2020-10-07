import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
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
import { StyleService } from '../../layer/shared/style.service';
import { StyleListService } from '../style-list/style-list.service';
import { skipWhile } from 'rxjs/operators';
import { EntityRecord, Workspace } from '@igo2/common';
import type { WorkspaceStore } from '@igo2/common';
import { WfsWorkspace } from '../../workspace/shared/wfs-workspace';
import { FeatureWorkspace } from '../../workspace/shared/feature-workspace';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'igo-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent implements OnDestroy, OnInit {
  public form: FormGroup;
  public formats$ = new BehaviorSubject(undefined);
  public encodings$ = new BehaviorSubject(undefined);
  public exportableLayers$: BehaviorSubject<AnyLayer[]> = new BehaviorSubject(
    []
  );
  public inputProj: string = 'EPSG:4326';
  public loading$ = new BehaviorSubject(false);
  public forceNaming = false;
  public controlFormat = 'format';

  private layers$$: Subscription;
  private exportableLayers$$: Subscription;
  private formats$$: Subscription;
  private encodings$$: Subscription;
  private formLayer$$: Subscription;
  private exportOptions$$: Subscription;

  private espgCodeRegex = new RegExp('^\\d{4,6}');
  private clientSideFileSizeMax: number;
  public fileSizeMb: number;

  public popupChecked: boolean = false;

  private previousLayerSpecs$: BehaviorSubject<
    {
      id: string;
      visible: boolean;
      opacity: number;
      queryable: boolean;
    }[]
  > = new BehaviorSubject(undefined);

  @Input() map: IgoMap;

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
    private formBuilder: FormBuilder,
    private config: ConfigService,
    private cdRef: ChangeDetectorRef,
    private storageService: StorageService
  ) {
    this.loadConfig();
    this.buildForm();
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
  }

  private getWorkspaceByLayerId(id: string): Workspace {
    const wksFromLayerId = this.store
      .all()
      .find(workspace => (workspace as WfsWorkspace | FeatureWorkspace).layer.id === id);
    if (wksFromLayerId) {
      return wksFromLayerId;
    }
    return;
  }

  public getLayerTitleById(id): string {
    return this.map.getLayerById(id).title;
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

  handlePopup(preCheck: boolean = true): boolean {
    const p1 = window.open('', '_blank');
    p1.close();
    const p2 = window.open('', '_blank');
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
    if (
      !this.popupChecked &&
      data.layers.length > 1 &&
      (ogreFormats.indexOf(data.format) >= 0 || data.format === ExportFormat.URL) &&
      !this.popupAllowed) {
      this.handlePopup();
    }

    data.layers.forEach((layer) => {
      const lay = this.map.getLayerById(layer);
      let filename = lay.title;
      if (data.name !== undefined) {
        filename = data.name;
      }
      const dSOptions: DataSourceOptions = lay.dataSource.options;
      if (
        data.format === ExportFormat.URL &&
        dSOptions.download &&
        dSOptions.download.url
      ) {
        setTimeout(() => {
          // better look an feel
          window.open(dSOptions.download.url, '_blank');
          this.loading$.next(false);
        }, 500);
        return;
      }
      const wks = this.getWorkspaceByLayerId(layer);
      let olFeatures;
      if (wks && wks.entityStore && wks.entityStore.stateView.all().length) {

        if (data.layersWithSelection.indexOf(layer) !== -1 && data.featureInMapExtent) {
          // Only export selected feature &&  into map extent
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
        if (data.featureInMapExtent) {
          olFeatures = lay.dataSource.ol.getFeaturesInExtent(
            lay.map.viewController.getExtent()
          );
        } else {
          olFeatures = lay.dataSource.ol.getFeatures();
        }
        if (lay.dataSource instanceof ClusterDataSource) {
          olFeatures = olFeatures.flatMap((cluster: any) =>
            cluster.get('features')
          );
        }
      }

      this.exportService
        .export(olFeatures, data.format, filename, data.encoding, this.map.projection)
        .subscribe(
          () => { },
          (error: Error) => this.onFileExportError(error),
          () => {
            this.onFileExportSuccess();
            this.loading$.next(false);
          }
        );
    });
  }

  private buildForm() {
    if (this.forceNaming) {
      this.form = this.formBuilder.group({
        format: ['', [Validators.required]],
        layers: [[], [Validators.required]],
        layersWithSelection: [[]],
        encoding: [EncodingFormat.UTF8, [Validators.required]],
        featureInMapExtent: [false, [Validators.required]],
        name: ['', [Validators.required]]
      });
    } else {
      this.form = this.formBuilder.group({
        format: ['', [Validators.required]],
        layers: [[], [Validators.required]],
        layersWithSelection: [[]],
        encoding: [EncodingFormat.UTF8, [Validators.required]],
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

  private onPopupBlockedError(preCheck: boolean = true) {
    this.loading$.next(false);
    const translate = this.languageService.translate;
    const title = translate.instant('igo.geo.export.popupBlocked.title');
    const extraMessage = preCheck ? translate.instant('igo.geo.export.popupBlocked.selectAgain') : translate.instant('igo.geo.export.popupBlocked.retry');
    const message = translate.instant('igo.geo.export.popupBlocked.text', { extraMessage });
    this.messageService.error(message, title, { timeOut: 20000 });
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
    if (layers && layers.length) {
      const formatsType = {
        onlyUrl: false,
        onlyVector: false,
        vectorAndUrl: false
      };
      layers.forEach((layer) => {
        if (!layer) {
          return;
        }
        if (
          !(layer instanceof VectorLayer) &&
          layer.dataSource.options.download &&
          layer.dataSource.options.download.url
        ) {
          formatsType.onlyUrl = true;
        } else if (
          layer.dataSource.options.download &&
          layer.dataSource.options.download.url
        ) {
          formatsType.vectorAndUrl = true;
        } else if (layer instanceof VectorLayer) {
          formatsType.onlyVector = true;
        }
      });

      if (formatsType.onlyUrl === true && formatsType.onlyVector === false) {
        this.formats$.next(strEnum(['URL']));
      } else if (
        formatsType.onlyVector === true &&
        formatsType.onlyUrl === false
      ) {
        this.computeFormats(); // reset
        if (ExportFormat.URL in this.formats$.value) {
          const keys = Object.keys(this.formats$.value).filter(
            (key) => key !== 'URL'
          );
          this.formats$.next(strEnum(keys));
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
          this.formats$.next(strEnum(keys));
        }
      } else {
        this.formats$.next([]);
        this.messageService.alert(
          this.languageService.translate.instant(
            'igo.geo.export.noFormat.text'
          ),
          this.languageService.translate.instant(
            'igo.geo.export.noFormat.title'
          )
        );
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
    handleFileExportSuccess(this.messageService, this.languageService);
  }

  onImportExportChange(event) {
    this.selectedMode = event.value;
  }
}

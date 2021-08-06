import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlider } from '@angular/material/slider';
import { DownloadRegionService, MessageService, RegionDBData, StorageQuotaService, TileDownloaderService, TileGenerationParams, TileToDownload } from '@igo2/core';
import { Feature, FEATURE, GeoJSONGeometry, IgoMap, XYZDataSource } from '@igo2/geo';
import { uuid } from '@igo2/utils';
import OlFeature from 'ol/Feature';
import * as olformat from 'ol/format';
import * as olProj from 'ol/proj';
import { Observable, Subscription } from 'rxjs';
import { map, skip } from 'rxjs/operators';
import { DownloadState } from '../download.state';
import { RegionDrawComponent } from '../region-draw/region-draw.component';
import { TileGenerationOptionComponent } from '../tile-generation-option/tile-generation-option.component';
import { TransferedTile } from '../TransferedTile';
import { CreationEditionStrategy } from './editing-strategy/creation-editing-strategy';
import { EditionStrategy } from './editing-strategy/edition-strategy';
import { RegionDownloadEstimationComponent } from './region-download-estimation/region-download-estimation.component';
import { RegionEditorController } from './region-editor-controller';
import { AddTileError, AddTileErrors } from './region-editor-utils';
import { EditedRegion, RegionEditorState } from './region-editor.state';


@Component({
  selector: 'igo-region-editor',
  templateUrl: './region-editor.component.html',
  styleUrls: ['./region-editor.component.scss']
})
export class RegionEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('depthSlider') slider: MatSlider;
  @ViewChild('progressBar') progressBar: MatProgressBar;
  @ViewChild('genParam') genParamComponent: TileGenerationOptionComponent;
  @ViewChild('regionDraw') regionDrawComponent: RegionDrawComponent;
  @ViewChild('regionDownloadEstimation') 
    regionDownloadEstimation: RegionDownloadEstimationComponent;

  private controller: RegionEditorController;

  
  private _nTilesToDownload: number;
  private _notEnoughSpace$: Observable<boolean>;
  private _progression: number = 0;

  activateDrawingTool: boolean = true;

  isDownloading$: Observable<boolean>;
  isDownloading$$: Subscription;

  private addNewTile$$: Subscription;

  get openedWithMouse() {
    return this.downloadState.openedWithMouse;
  }

  constructor(
    private tileDownloader: TileDownloaderService,
    private downloadService: DownloadRegionService,
    private downloadState: DownloadState,
    private state: RegionEditorState,
    private messageService: MessageService,
    private storageQuota: StorageQuotaService,
    private cdRef: ChangeDetectorRef
  ) {
    this.initController();

    if (this.openedWithMouse) {
      this.deactivateDrawingTool();
    }

    const numberToSkip = this.openedWithMouse ? 0 : 1;
    this.addNewTile$$ = this.downloadState.addNewTile$
      .pipe(skip(numberToSkip))
      .subscribe((tile: TransferedTile) => {
        if (!tile) {
          return;
        }
        this.addTileToDownload(tile.coord, tile.templateUrl, tile.tileGrid);
      });

    this.isDownloading$ = this.tileDownloader.isDownloading$;

    if (!this.progression$) {
      this.progression$ = this.tileDownloader.progression$
        .pipe(map((value: number) => {
          return Math.round(value * 100);
        }));
    }
  }

  private initController() {
    this.controller = new RegionEditorController(this.state, this.downloadState);
  }

  ngOnInit() {
    if (!this.editedTilesFeature) {
      this.regionStore.updateMany(this.editedTilesFeature);
    }
  }

  ngAfterViewInit() {
    this.genParamComponent.tileGenerationParams = this.genParams;
  }

  ngOnDestroy() {
    this.addNewTile$$.unsubscribe();
    this.regionStore.clear();
  }

  transformGeometry(geometry: GeoJSONGeometry, proj: string): GeoJSONGeometry {
    const coords = geometry.coordinates;
    switch (geometry.type) {
      case 'Point':
        geometry.coordinates = olProj.transform(coords, 'EPSG:4326', proj);
        break;

      case 'LineString':
        geometry.coordinates = coords.map((coord) => olProj.transform(coord, 'EPSG:4326', proj));
        break;

      case 'Polygon':
        geometry.coordinates = [coords[0].map((coord) => olProj.transform(coord, 'EPSG:4326', proj))];
        break;

      default:
        throw Error('Geometry not yet supported for transform');
    }
    return geometry;
  }

  geoJSONToFeature(geometry: GeoJSONGeometry) {
    const id = uuid();
    const previousRegion = this.regionStore.get(id);
    const previousRegionRevision = previousRegion ? previousRegion.meta.revision : 0;

    const mapProj = this.map.projection;
    const transformedGeometry = this.transformGeometry(geometry, this.map.projection);

    const feature = new OlFeature(transformedGeometry);
    const projectionIn = 'EPSG:4326';
    const projectionOut = 'EPSG:4326';
    const featuresText: string = new olformat.GeoJSON().writeFeature(
      feature,
      {
        dataProjection: projectionOut,
        featureProjection: projectionIn,
        featureType: 'feature',
        featureNS: 'http://example.com/feature'
      }
    );

    const regionFeature: Feature = {
      type: FEATURE,
      geometry: transformedGeometry,
      projection: this.map.projection,
      properties: {
        id,
        stopOpacity: 1
      },
      meta: {
        id,
        revision: previousRegionRevision + 1
      },
      ol: feature
    };
    return regionFeature;
  }

  public onGenerationParamsChange() {
    this.genParams = this.genParamComponent.tileGenerationParams;
  }

  public clearFeatures() {
    this.editedTilesFeature = new Array();
    this.regionStore.clear();
  }

  public showEditedRegionFeatures() {
    this.regionStore.clear();
    if (!this.editedTilesFeature) {
      return;
    }
    this.regionStore.updateMany(this.editedTilesFeature);
  }
  // TODO replace for controler download need to not forget deactivatedrawingtool
  // before controller.addTileToDownload
  //  this.showEditedRegionFeatures() after every thing

  addTileToDownload(coord: [number, number, number], templateUrl, tileGrid) {
    if (this.regionStore.index.size && this.tilesToDownload.length === 0) {
        return;
      }
    this.deactivateDrawingTool();
    try {
      this.controller.addTileToDownload(coord, templateUrl, tileGrid);
      this.showEditedRegionFeatures();
    } catch(e) {
      if (!(e instanceof AddTileError)) {
        return;
      }
      this.sendAddTileErrorMessage(e);
    //   switch ((e as  AddTileError).addTileError) {
    //     case AddTileErrors.CARTO_BACKGROUND:
    //       this.messageService.error('The tile you selected is not on the same cartographic background');
    //       break;

    //     case AddTileErrors.LEVEL:
    //       this.messageService.error('The tile you selected is not on the same level as the previous ones');
    //       break;

    //     case AddTileErrors.ALREADY_SELECTED:
    //       this.messageService.error('The tile is already selected');
    //   }
    }
  }

  // TODO maybe better name
  sendAddTileErrorMessage(error: AddTileError) {
    switch (error.addTileError) {
      case AddTileErrors.CARTO_BACKGROUND:
        this.messageService.error('The tile you selected is not on the same cartographic background');
        break;

      case AddTileErrors.LEVEL:
        this.messageService.error('The tile you selected is not on the same level as the previous ones');
        break;

      case AddTileErrors.ALREADY_SELECTED:
        this.messageService.error('The tile is already selected');
        break;
      
      case AddTileErrors.ALREADY_DOWNLOADING:
        this.messageService.error('There is already a region downloading');
        break;
    }
  }

  private setTileGridAndTemplateUrl() {
    const baseLayer = this.map.getBaseLayers();
    baseLayer.forEach((layer) => {
      if (!layer.visible) {
        return;
      }
      if (!(layer.dataSource instanceof XYZDataSource)) {
        return;
      }
      this.templateUrl = layer.dataSource.options.url;
      this.tileGrid = layer.ol.getSource().tileGrid;
    });
  }

  public onDownloadClick() {
    if (!this.hasEditedRegion()) {
      return;
    }

    if (this.isDrawingMode) {
      this.setTileGridAndTemplateUrl();
      this.parentLevel = this.map.getZoom();
      this.cdRef.detectChanges();
      this.genParams = this.genParamComponent.tileGenerationParams;
      const geometry = this.drawnRegionGeometryForm.value;
      const features = [this.geoJSONToFeature(geometry)];
      this.editedRegion.features = features;
    }

    this.genParams = this.genParamComponent.tileGenerationParams;

    this._nTilesToDownload = this.numberOfTilesToDownload();

    if (this.isDownloading$$) {
      this.isDownloading$$.unsubscribe();
    }

    this.isDownloading$$ = this.isDownloading$
      .pipe(skip(1))
      .subscribe((value) => {
        this.isDownloading = value;
        if (!value) {
          this.messageService.success('Your download is done');
          this.clear();
        }
      });
    this.editionStrategy.download(this.editedRegion, this.downloadService);
  }

  private clearEditedRegion() {
    // TODO need to put that in state
    this.editedRegion = undefined;
    this.parentTileUrls = new Array();
    this.editionStrategy = new CreationEditionStrategy();
    this.genParamComponent.tileGenerationParams = this.genParams;
    this.clearFeatures();
  }

  private clear() {
    this.activateDrawingTool = true;
    this.drawnRegionGeometryForm.reset();
    this.regionStore.clear();
    this.clearEditedRegion();
  }

  public onCancelClick() {
    if (this.isDownloading) {
      this.editionStrategy.cancelDownload(this.downloadService);
    } else {
      this.clear();
    }
  }

  public numberOfTilesToDownload() {
    const geometries = this.isDrawingMode ? [this.drawnRegionGeometryForm.value] : [];

    if (this.isDrawingMode) {
      this.setTileGridAndTemplateUrl();
    }

    if (this.genParamComponent) {
      if (this.genParamComponent.parentLevel !== this.parentLevel) {
        this.genParamComponent.parentLevel = this.parentLevel;
      }
    }

    const genParams = !this.genParamComponent ?
      this.genParams : this.genParamComponent.tileGenerationParams;
    return this.editionStrategy.estimateRegionDownloadSize(
      this.regionDownloadEstimation,
      this.tilesToDownload,
      geometries,
      genParams,
      this.tileGrid
    );
  }

  public updateRegion(region: RegionDBData) {
    this.deactivateDrawingTool();
    try {
      this.controller.updateRegion(region);
    } catch(e) {
      if (!(e instanceof AddTileError)) {
        return;
      }
      this.sendAddTileErrorMessage(e);
    }
    this.genParamComponent.tileGenerationParams = region.generationParams;
    this.showEditedRegionFeatures();
    // if (!region) {
    //   return;
    // }

    // if (this.isDownloading) {
    //   this.messageService.error('There is already a region downloading');
    //   return;
    // }
    // this.clearEditedRegion();
    // this.loadEditedRegion(region);
    // this.editionStrategy = new UpdateEditionStrategy(region);
  }
  // TODO dont forget to add this.genParamComponent.tileGenerationParams = region.generationParams;
  // private loadEditedRegion(region: RegionDBData) {
    
  // }
  //   region.parentUrls.forEach((url: string) => {
  //     this.parentTileUrls.push(url);
  //     this.urlsToDownload.add(url);
  //   });
  //   this.regionName = region.name;

  //   this.parentLevel = region.generationParams.parentLevel;
  //   this.genParams = region.generationParams;
  //   this.genParamComponent.tileGenerationParams = region.generationParams;
  //   this.editedTilesFeature = region.parentFeatureText.map((featureText) => {
  //     return JSON.parse(featureText);
  //   });
  // }

  private deactivateDrawingTool() {
    this.drawnRegionGeometryForm.reset();
    this.activateDrawingTool = false;
  }

  public hasEditedRegion(): boolean{
    if (!this.regionDrawComponent) {
      return this.tilesToDownload.length !== 0
      || this.regionStore.index.size !== 0;
    }
    const regionDrawIsEmpty = this.regionDrawComponent.regionGeometryForm.value === null;
    return this.tilesToDownload.length !== 0
    || this.regionStore.index.size !== 0
    || !regionDrawIsEmpty;
  }

  get drawnRegionGeometryForm(): FormControl {
    return this.state.drawnRegionGeometryForm;
  }

  set drawnRegionGeometryForm(form: FormControl) {
    this.state.drawnRegionGeometryForm = form;
  }

  get isDrawingMode(): boolean {
    return this.drawnRegionGeometryForm.value !== null;
  }

  get igoMap(): IgoMap {
    return this.state.map;
  }

  get downloadButtonTitle() {
    return this.editionStrategy.downloadButtonTitle;
  }

  get regionStore() {
    return this.downloadState.regionStore;
  }

  private get map() {
    return this.downloadState.map;
  }

  set editedRegion(editedRegion) {
    this.state.editedRegion = editedRegion;
  }

  get editedRegion(): EditedRegion {
    return this.state.editedRegion;
  }

  set tileGrid(tileGrid: any) {
    this.state.editedRegion.tileGrid = tileGrid;
  }

  get tileGrid(): any {
    return this.state.editedRegion.tileGrid;
  }

  set templateUrl(templateUrl: string) {
    this.state.editedRegion.templateUrl = templateUrl;
  }

  get templateUrl(): string {
    return this.state.editedRegion.templateUrl;
  }

  get parentTileUrls(): Array<string> {
    return this.state.parentTileUrls;
  }

  set parentTileUrls(urls: Array<string>) {
    this.state.parentTileUrls = urls;
  }

  set regionName(name: string) {
    this.state.regionName = name;
  }

  get regionName(): string {
    return this.state.regionName;
  }

  set urlsToDownload(urls: Set<string>) {
    this.state.urlsToDownload = urls;
  }

  get urlsToDownload(): Set<string> {
    return this.state.urlsToDownload;
  }

  set tilesToDownload(tiles: TileToDownload[]) {
    this.state.tilesToDownload = tiles;
  }

  get tilesToDownload(): TileToDownload[] {
      return this.state.tilesToDownload;
  }

  set genParams(depth: TileGenerationParams) {
      this.state.genParams = depth;
  }

  get genParams(): TileGenerationParams {
      return this.state.genParams;
  }

  get depth(): number {
    const depth = this.genParams.endLevel - this.genParams.startLevel;
    if (Number.isNaN(depth)) {
      return 0;
    }
    return depth;
  }

  set parentLevel(level: number) {
    this.state.parentLevel = level;
  }

  get parentLevel(): number {
    if (this.isDrawingMode) {
      return this.map.getZoom();
    }
    return this.state.parentLevel;
  }

  set editedTilesFeature(features: Feature[]) {
      this.state.editedTilesFeatures = features;
  }

  get editedTilesFeature(): Feature[] {
      return this.state.editedTilesFeatures ;
  }

  set progression$(progression$: Observable<number>) {
    this.state.progression$ = progression$;
  }

  get progression$(): Observable<number> {
    return this.state.progression$;
  }

  set isDownloading(value: boolean) {
    this.state.isDownloading = value;
  }

  get isDownloading(): boolean {
    return this.state.isDownloading;
  }

  get invalidDownloadSize$(): Observable<boolean> {
    return this._notEnoughSpace$;
  }

  get progression(): number {
    return Math.round(this._progression * 100);
  }

  get disableSlider() {
    return this.isDownloading
    || !this.editionStrategy.enableGenEdition
    || !this.hasEditedRegion();
  }

  get disableDownloadButton() {
    return !this.regionName
    || this.isDownloading
    || (!this.hasEditedRegion() && this.regionStore.index.size === 0);
  }

  get editionStrategy(): EditionStrategy {
    return this.state.editionStrategy;
  }

  set editionStrategy(strategy: EditionStrategy) {
    this.state.editionStrategy = strategy;
  }
}

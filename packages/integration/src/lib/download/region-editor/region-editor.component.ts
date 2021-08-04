import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlider } from '@angular/material/slider';
import { DownloadEstimator, DownloadRegionService, MessageService, RegionDBData, StorageQuotaService, TileDownloaderService, TileToDownload } from '@igo2/core';
import { TileGenerationParams } from '@igo2/core/lib/download/tile-downloader/tile-generation-strategies/tile-generation-params.interface';
import { Feature, FEATURE, GeoJSONGeometry, IgoMap, XYZDataSource } from '@igo2/geo';
import { uuid } from '@igo2/utils';
import { Geometry } from '@turf/helpers';
import OlFeature from 'ol/Feature';
import * as olformat from 'ol/format';
import { fromExtent } from 'ol/geom/Polygon';
import * as olProj from 'ol/proj';
import { createFromTemplate } from 'ol/tileurlfunction.js';
import { Observable, Subscription } from 'rxjs';
import { map, skip } from 'rxjs/operators';
import { DownloadState } from '../download.state';
import { RegionDrawComponent } from '../region-draw/region-draw.component';
import { TileGenerationOptionComponent } from '../tile-generation-option/tile-generation-option.component';
import { TransferedTile } from '../TransferedTile';
import { CreationEditionStrategy } from './editing-strategy/creation-editing-strategy';
import { EditionStrategy } from './editing-strategy/edition-strategy';
import { UpdateEditionStrategy } from './editing-strategy/update-editing-strategy';
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

  private _nTilesToDownload: number;
  private _notEnoughSpace$: Observable<boolean>;
  private _progression: number = 0;
  private downloadEstimator = new DownloadEstimator();

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
    this.updateVariables();
  }

  private updateVariables() {
    const sizeEstimationBytes = this.sizeEstimationInBytes();
    this._notEnoughSpace$ = this.storageQuota.enoughSpace(sizeEstimationBytes)
    .pipe(map((value) => {
      return !value;
    }));
  }

  private getTileFeature(tileGrid, coord: [number, number, number]): Feature {
    const id = uuid();
    const previousRegion = this.regionStore.get(id);
    const previousRegionRevision = previousRegion ? previousRegion.meta.revision : 0;

    const polygonGeometry = fromExtent(tileGrid.getTileCoordExtent(coord));

    const feature: OlFeature = new OlFeature(polygonGeometry);

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
      geometry: JSON.parse(featuresText).geometry,
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

  addTileToDownload(coord: [number, number, number], templateUrl, tileGrid) {
    if (this.regionStore.index.size && this.tilesToDownload.length === 0) {
      return;
    }

    this.deactivateDrawingTool();

    try {
      const urlGen = createFromTemplate(templateUrl, tileGrid);
      const url = urlGen(coord, 0, 0);
      const z = coord[0];
      const first: boolean = this.parentTileUrls.length === 0;

      if (first) {
        this.parentLevel = z;
        this.tileGrid = tileGrid;
        this.templateUrl = templateUrl;
      }

      if (!first && tileGrid !== this.tileGrid
        && templateUrl !== this.templateUrl
      ) {
        this.messageService.error('The tile you selected is not on the same cartographic background');
        return;
      }

      if (z !== this.parentLevel && !first) {
        this.messageService.error('The tile you selected is not on the same level as the previous ones');
        return;
      }

      if (!this.urlsToDownload.has(url) || first) {
        this.urlsToDownload.add(url);

        const feature = this.getTileFeature(tileGrid, coord);
        const featureText = JSON.stringify(feature);

        this.editedTilesFeature.push(feature);
        this.tilesToDownload.push({ url, coord, featureText});
        this.parentTileUrls.push(url);

        this.showEditedRegionFeatures();
      } else {
        this.messageService.error('The tile is already selected');
      }
    } catch (e) {
      return;
    }
  }

  public downloadDrawingFeatures() {
    const features = [...this.regionStore.index.values()];
    const layers = this.map.ol.getLayers();
    let tileGrid;
    let templateUrl;
    layers.forEach((layer) => {
      const igoLayer = this.map.getLayerByOlUId(layer.ol_uid);
      if (!igoLayer || !(igoLayer.dataSource instanceof XYZDataSource)) {
        return;
      }
      if (!tileGrid) {
        tileGrid = layer.getSource().tileGrid;
        templateUrl = igoLayer.dataSource.options.url;
      }
    });
    this.parentLevel = this.map.getZoom();
    this.cdRef.detectChanges();
    this.genParams = this.genParamComponent.tileGenerationParams;

    const featuresString: string[] = features.map(feature => JSON.stringify(feature));
    const geometries: Geometry[] = features.map(feature => feature.geometry);
    this.downloadService.downloadRegionFromFeatures(
      featuresString,
      geometries,
      this.regionName,
      this.genParams,
      tileGrid,
      templateUrl
    );
  }

  private setTileGridAndTemplateUrl() {
    const layers = this.map.ol.getLayers();
    this.tileGrid = undefined;
    this.templateUrl = undefined;
    layers.forEach((layer) => {
      const igoLayer = this.map.getLayerByOlUId(layer.ol_uid);
      if (!igoLayer || !(igoLayer.dataSource instanceof XYZDataSource)) {
        return;
      }
      if (!this.tileGrid) {
        this.tileGrid = layer.getSource().tileGrid;
        this.templateUrl = igoLayer.dataSource.options.url;
      }
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
    this.updateVariables();
  }

  public onCancelClick() {
    if (this.isDownloading) {
      this.editionStrategy.cancelDownload(this.downloadService);
    } else {
      this.clear();
    }
  }

  private sizeEstimationInBytes(): number {
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
    return this.downloadEstimator.estimateRegionDownloadSizeInBytes(
      this.tilesToDownload,
      geometries,
      genParams,
      this.tileGrid);
  }

  public sizeEstimationInMB() {
    const size = this.sizeEstimationInBytes();
    return (size * 1e-6).toFixed(4);
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
    return this.downloadEstimator.estimateDownloadSize(
      this.tilesToDownload,
      geometries,
      genParams,
      this.tileGrid
    );
  }

  public updateRegion(region: RegionDBData) {
    this.deactivateDrawingTool();

    if (!region) {
      return;
    }

    if (this.isDownloading) {
      this.messageService.error('There is already a region downloading');
      return;
    }
    this.clearEditedRegion();
    this.loadEditedRegion(region);
    this.editionStrategy = new UpdateEditionStrategy(region);
    this.showEditedRegionFeatures();
  }

  private loadEditedRegion(region: RegionDBData) {
    region.parentUrls.forEach((url: string) => {
      this.parentTileUrls.push(url);
      this.urlsToDownload.add(url);
    });
    this.regionName = region.name;

    this.parentLevel = region.generationParams.parentLevel;
    this.genParams = region.generationParams;
    this.genParamComponent.tileGenerationParams = region.generationParams;
    this.editedTilesFeature = region.parentFeatureText.map((featureText) => {
      return JSON.parse(featureText);
    });
  }

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
  // TODO remove
  get disableCancelButton() {
    return false;
  }

  get editionStrategy(): EditionStrategy {
    return this.state.editionStrategy;
  }

  set editionStrategy(strategy: EditionStrategy) {
    this.state.editionStrategy = strategy;
  }
}

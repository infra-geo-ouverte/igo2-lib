import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlider } from '@angular/material/slider';
import { DownloadRegionService, MessageService, RegionDBData, StorageQuotaService, TileDownloaderService, TileToDownload } from '@igo2/core';
import { TileGenerationParams } from '@igo2/core/lib/download/tile-downloader/tile-generation-strategies/tile-generation-params.interface';
import { Tile } from '@igo2/core/lib/download/Tile.interface';
import { Feature, FEATURE, FeatureStore, IgoMap, XYZDataSource } from '@igo2/geo';
import { uuid } from '@igo2/utils';
import intersect from '@turf/intersect';
import { Polygon } from 'geojson';
import OlFeature from 'ol/Feature';
import * as olformat from 'ol/format';
import { fromExtent } from 'ol/geom/Polygon';
import { createFromTemplate } from 'ol/tileurlfunction.js';
import { interval, Observable, Subscription } from 'rxjs';
import { map, skip, take } from 'rxjs/operators';
import { DownloadState } from '../download.state';
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

  first: boolean = true;
  // tilesFeatures: Feature[] = new Array();
  
  getTileGeometry(tile: Tile, tileGrid): Polygon {
    const tileGeometry = fromExtent(tileGrid.getTileCoordExtent([tile.Z, tile.X, tile.Y]));
    const feature: OlFeature = new OlFeature(tileGeometry);

    const projectionIn = 'EPSG:4326';
    const projectionOut = 'EPSG:4326';
    
    const featureText = new olformat.GeoJSON().writeFeature(
      feature,
      {
        dataProjection: projectionOut,
        featureProjection: projectionIn,
        featureType: 'feature',
        featureNS: 'http://example.com/feature'
      }
    );
    return JSON.parse(featureText).geometry;
  }

  tileInsidePolygon(polygon: Polygon, tile: Tile, tileGrid): boolean {
    const tileGeometry: Polygon = this.getTileGeometry(tile, tileGrid) as Polygon;
    try {
      const intersection = intersect(polygon, tileGeometry);
      if (!intersection) {
        return false;
      }
      return true;
    } catch(e) {
      return false;
    }
    
  }

  onTestClick() {
    const features = [...this.drawStore.index.values()];
    const layers = this.map.ol.getLayers();
    let tileGrid = undefined;
    layers.forEach((layer) => {
      const igoLayer = this.map.getLayerByOlUId(layer.ol_uid);
      if (!igoLayer || !(igoLayer.dataSource instanceof XYZDataSource)) {
        return;
      }
      if (!tileGrid) {
        tileGrid = layer.getSource().tileGrid;
      }
    });
    const startZ = this.map.getZoom();
    interval(1000).pipe(take(4)).subscribe((count) => {
      const tiles = this.getTilesFromFeatures(features, startZ + count, tileGrid);
      const tilesFeatures = tiles.map((tile: Tile) => {
      const coord: [number, number, number] = [tile.Z, tile.X, tile.Y];
        return this.getTileFeature(tileGrid, coord);
      });
      this.regionStore.clear();
      this.regionStore.updateMany(tilesFeatures)
      console.log('tiles gen by tiles from features', tiles);
    });
  }

  // findIntersect(): Feature[] {
  //   const regionFeatures = Array.from(this.regionStore.index.values());
  //   const regionPolygons = regionFeatures.map(feature => feature.geometry as Polygon);
  //   console.log('tilePolygons:', regionPolygons);

  //   const drawFeatures =  Array.from(this.drawStore.index.values());
  //   const drawPolygons = drawFeatures.map(feature => feature.geometry as Polygon);
  //   console.log('drawPolygons:', drawPolygons);
    
  //   let drawRegionIntersect: Feature[] = new Array();
  //   for (let drawPolygon of drawPolygons) {
  //     const regionIntersection : Feature[] = regionPolygons.map((regionPolygon: Polygon) => {
  //       const polygon = intersect(drawPolygon, regionPolygon).geometry;
  //       if (polygon.coordinates.length == 0) {
  //         return;
  //       }
  //       console.log('inter polygon', polygon);
  //       const id = uuid();
  //       const previousRegion = this.regionStore.get(id);
  //       const previousRegionRevision = previousRegion ? previousRegion.meta.revision : 0;
  //       const feature: OlFeature = new OlFeature(polygon);
  //       console.log('inter feature', feature);

  //       const interFeature: Feature = {
  //         type: FEATURE,
  //         geometry: polygon,
  //         projection: this.map.projection,
  //         properties: {
  //           id,
  //           stopOpacity: 1
  //         },
  //         meta: {
  //           id,
  //           revision: previousRegionRevision + 1
  //         },
  //         ol: feature
  //       };
  //       return interFeature;
  //     });
  //     drawRegionIntersect = drawRegionIntersect.concat(regionIntersection);
  //   }
  //   console.log('common polygon:', drawRegionIntersect);
  //   return drawRegionIntersect;
  //   // this.drawStore.clear();
  //   // this.regionStore.clear();
  //   // this.regionStore.updateMany(drawRegionIntersect);
  // }

  getTilesFromFeature(feature: Feature, z:number, tileGrid): Tile[] {
    const geometry = feature.geometry;
    console.log('feature geometry:', geometry);
    if (!geometry) {
      return;
    }
    
    // const z = this.map.viewController.getZoom();
    if (geometry.type === 'Point') {
      const coord = tileGrid.getTileCoordForCoordAndZ(geometry.coordinates, z);
      return [{
        Z: coord[0],
        X: coord[1],
        Y: coord[2]
      }]
    }
    
    const coords = geometry.coordinates[0];
    const startPoint = coords[0];
    console.log('start point:', startPoint);
    const firstCoord: [number, number, number] = tileGrid.getTileCoordForCoordAndZ(startPoint, z);
    console.log('first coord', firstCoord);
    const firstTile: Tile = {
      Z: firstCoord[0],
      X: firstCoord[1],
      Y: firstCoord[2]
    }

    const polygon = geometry as Polygon;
    const tilesCoveringPolygon: Tile[] = new Array();
    const tileToVisit: Tile[] = new Array();
    tileToVisit.push(firstTile);
    const visitedTiles: Set<string> = new Set();
    while (tileToVisit.length != 0) {
      const currentTile: Tile = tileToVisit.shift();
      const currentTileString: string = JSON.stringify(currentTile);
      if (!visitedTiles.has(currentTileString) && 
        this.tileInsidePolygon(polygon, currentTile, tileGrid)
      ) {
        tilesCoveringPolygon.push(currentTile);

        const top = {
          Z: currentTile.Z,
          X: currentTile.X,
          Y: currentTile.Y - 1
        };
        if (!visitedTiles.has(JSON.stringify(top))) {
          tileToVisit.push(top);
        }

        const bottom = {
          Z: currentTile.Z,
          X: currentTile.X,
          Y: currentTile.Y + 1
        };
        if (!visitedTiles.has(JSON.stringify(bottom))) {
          tileToVisit.push(bottom);
        }

        const right = {
          Z: currentTile.Z,
          X: currentTile.X + 1,
          Y: currentTile.Y
        };
        if (!visitedTiles.has(JSON.stringify(right))) {
          tileToVisit.push(right);
        }

        const left = {
          Z: currentTile.Z,
          X: currentTile.X - 1,
          Y: currentTile.Y
        };
        if (!visitedTiles.has(JSON.stringify(left))) {
          tileToVisit.push(left);
        }
      }
      visitedTiles.add(currentTileString);
    }
    
    return tilesCoveringPolygon;
  }

  getTilesFromFeatures(features: Feature[], z: number, tileGrid): Tile[] {
    let tiles: Tile[] = new Array();
    features.forEach((feature) => {
      tiles = tiles.concat(this.getTilesFromFeature(feature, z, tileGrid));
    });
    return tiles;
  }

  constructor(
    private tileDownloader: TileDownloaderService,
    private downloadService: DownloadRegionService,
    private downloadState: DownloadState,
    private state: RegionEditorState,
    private messageService: MessageService,
    private storageQuota: StorageQuotaService,
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
          return Math.round(value / this._nTilesToDownload * 100);
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

  public onGenerationParamsChange() {
    this.genParams = this.genParamComponent.tileGenerationParams;
    this.updateVariables();
  }

  private updateVariables() {
    this._notEnoughSpace$ = this.storageQuota.enoughSpace(this.sizeEstimationInBytes())
    .pipe(map((value) => {
      return !value;
    }));
  }

  private getTileFeature(tileGrid, coord: [number, number, number]): Feature {
    // console.log('getTileFeature:', coord);
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
    this.deactivateDrawingTool();
    console.log("ADD TILE TO DOWNLOAD coord:", coord, this.map.projection);
    try {
      const urlGen = createFromTemplate(templateUrl, tileGrid);
      const url = urlGen(coord, 0, 0);
      const z = coord[0];
      const first: boolean = this.parentTileUrls.length === 0;
      if (z !== this.parentLevel && !first) {
        this.messageService.error('The tile you selected is not on the same level as the previous ones');
        return;
      }

      if (first) {
        this.parentLevel = z;
      }

      if (!this.urlsToDownload.has(url) || first) {
        this.urlsToDownload.add(url);

        const feature = this.getTileFeature(tileGrid, coord);
        const featureText = JSON.stringify(feature);

        this.editedTilesFeature.push(feature);
        this.tilesToDownload.push({ url, coord, templateUrl, tileGrid, featureText});
        this.parentTileUrls.push(url);

        this.showEditedRegionFeatures();
        this.updateVariables();
      } else {
        this.messageService.error('The tile is already selected');
      }
    } catch (e) {
      return;
    }
  }

  public onDownloadClick() {
    if (this.parentTileUrls.length === 0) {
      return;
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
          this.clearEditedRegion();
        }
      });

    this.editionStrategy.download(this.editedRegion, this.downloadService);
  }

  private clearEditedRegion() {
    this.editedRegion = undefined;
    // need to put that in state
    this.parentTileUrls = new Array();
    this.editionStrategy = new CreationEditionStrategy();
    this.genParamComponent.tileGenerationParams = this.genParams;
    this.clearFeatures();
  }

  public onCancelClick() {
    this.activateDrawingTool = true;
    this.clearEditedRegion();
    this.updateVariables();
  }

  private sizeEstimationInBytes(): number {
    const space = this.tileDownloader.downloadEstimatePerDepth(this.depth);
    const nDownloads = this.parentTileUrls.length;
    return space * nDownloads;
  }

  public sizeEstimationInMB() {
    const size = this.sizeEstimationInBytes();
    return (size * 1e-6).toFixed(4);
  }

  public numberOfTilesToDownload() {
    const nTilesPerDownload = this.tileDownloader.numberOfTiles(this.depth);
    const nDownloads = this.parentTileUrls.length;
    return nTilesPerDownload * nDownloads;
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
    this.editionStrategy = new UpdateEditionStrategy(region);

    region.parentUrls.forEach((url: string) => {
      this.parentTileUrls.push(url);
      this.urlsToDownload.add(url);
    });
    // need to change
    this.regionName = region.name;

    this.parentLevel = region.generationParams.parentLevel;
    this.genParams = region.generationParams;
    this.genParamComponent.tileGenerationParams = region.generationParams;
    this.editedTilesFeature = region.parentFeatureText.map((featureText) => {
      return JSON.parse(featureText);
    });
    this.showEditedRegionFeatures();
    // this.changeGenerationParams(region.generationParams)
    // this.depth = region.generationParams.endLevel - region.generationParams.startLevel;
    // need to change
  }

  private deactivateDrawingTool() {
    // this.drawStore.clear();
    // this.activateDrawingTool = false;
  }

  get igoMap(): IgoMap {
    return this.state.map;
  }

  get drawStore(): FeatureStore<Feature> {
    return this.state.drawStore;
  }

  get downloadButtonTitle() {
    return this.editionStrategy.downloadButtonTitle;
  }

  private get regionStore() {
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
    return this.isDownloading || this.parentTileUrls.length === 0 || !this.editionStrategy.enableGenEdition;
  }

  get disableDownloadButton() {
    return !this.regionName || this.isDownloading || this.parentTileUrls.length === 0;
  }

  get disableCancelButton() {
    return this.isDownloading;
  }

  get editionStrategy(): EditionStrategy {
    return this.state.editionStrategy;
  }

  set editionStrategy(strategy: EditionStrategy) {
    this.state.editionStrategy = strategy;
  }
}

import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlider } from '@angular/material/slider';
import { DownloadRegionService, MessageService, RegionDBData, StorageQuotaService, TileDownloaderService, TileGenerationParams, TileToDownload } from '@igo2/core';
import { Feature, IgoMap } from '@igo2/geo';
import { Observable, Subscription } from 'rxjs';
import { map, skip } from 'rxjs/operators';
import { DownloadState } from '../download.state';
import { RegionDrawComponent } from '../region-draw/region-draw.component';
import { TileGenerationOptionComponent } from '../tile-generation-option/tile-generation-option.component';
import { TransferedTile } from '../TransferedTile';
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
    this.controller = new RegionEditorController(
      this.state,
      this.downloadState,
      this.cdRef
    );
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
      this.controller.addTileToDownload(coord, templateUrl, tileGrid);
      this.showEditedRegionFeatures();
    } catch(e) {
      if (!(e instanceof AddTileError)) {
        return;
      }
      this.sendAddTileErrorMessage(e);
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

  public onDownloadClick() {
    if (!this.controller.hasEditedRegion()) {
      return;
    }

    if (this.isDrawingMode) {
      this.controller.setTileGridAndTemplateUrl();
      this.controller.parentLevel = this.map.getZoom();
      this.cdRef.detectChanges();
      const geojson= this.drawnRegionGeometryForm.value;
      this.controller.loadGeoJSON(geojson);
    }

    this.genParams = this.genParamComponent.tileGenerationParams;

    if (this.isDownloading$$) {
      this.isDownloading$$.unsubscribe();
    }

    this.isDownloading$$ = this.isDownloading$
      .pipe(skip(1))
      .subscribe((value) => {
        this.isDownloading = value;
        if (!value) {
          this.messageService.success('Your download is done');
          this.controller.clear();
        }
      });
    this.controller.downloadEditedRegion(this.downloadService);
  }

  private clear() {
    this.activateDrawingTool = true;
    this.controller.clear();
  }

  public onCancelClick() {
    if (this.isDownloading) {
      this.editionStrategy.cancelDownload(this.downloadService);
    } else {
      this.clear();
      this.genParamComponent.tileGenerationParams = this.genParams;
    }
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
  }

  private deactivateDrawingTool() {
    this.drawnRegionGeometryForm.reset();
    this.activateDrawingTool = false;
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

  get disableGenerationParamsComponent() {
    return this.controller.disableGenerationParamsComponent;
  }

  get disableDownloadButton() {
    return this.controller.disableDownloadButton;
  }

  get editionStrategy(): EditionStrategy {
    return this.state.editionStrategy;
  }

  set editionStrategy(strategy: EditionStrategy) {
    this.state.editionStrategy = strategy;
  }
}

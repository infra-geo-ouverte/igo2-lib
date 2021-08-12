import { FormControl } from '@angular/forms';
import { TileGenerationParams, TileToDownload } from '@igo2/core';
import { Feature, IgoMap } from '@igo2/geo';
import { Observable } from 'rxjs';
import { DownloadState } from '../download.state';
import { EditionStrategy } from './editing-strategy';
import { EditedRegion, RegionEditorState } from './region-editor.state';

export class RegionEditorControllerBase {

  constructor(
      protected downloadState: DownloadState,
      protected state: RegionEditorState
  ) { }

  public hasEditedRegion(): boolean{
    if (!this.isDrawingMode) {
      return this.tilesToDownload.length !== 0
      || this.regionStore.index.size !== 0;
    }
    const regionDrawIsEmpty = this.drawnRegionGeometryForm.value === null;
    return this.tilesToDownload.length !== 0
    || this.regionStore.index.size !== 0
    || !regionDrawIsEmpty;
  }

  get disableDownloadButton() {
    return !this.regionName
    || this.isDownloading
    || (!this.hasEditedRegion() && this.regionStore.index.size === 0);
  }

  get disableGenerationParamsComponent() {
    return this.isDownloading
    || !this.editionStrategy.enableGenEdition
    || !this.hasEditedRegion();
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

  set genParams(tileGenerationParams: TileGenerationParams) {
      this.state.genParams = tileGenerationParams;
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

  get editionStrategy(): EditionStrategy {
    return this.state.editionStrategy;
  }

  set editionStrategy(strategy: EditionStrategy) {
    this.state.editionStrategy = strategy;
  }
}

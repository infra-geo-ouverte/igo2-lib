import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlider } from '@angular/material/slider';
import { ToolComponent } from '@igo2/common';
import { LayerListToolService } from '@igo2/geo';
import { createFromTemplate } from 'ol/tileurlfunction.js';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { DownloadState } from '../download.state';
import { TransferedTile } from '../TransferedTile';
import { MessageService, RegionDBService } from '@igo2/core';
import { first, map, skip, takeUntil, takeWhile } from 'rxjs/operators';
import { filter } from 'jszip';
import { DownloadToolState } from './../download-tool/download-tool.state';
import { MatInput } from '@angular/material/input';
import { TileDownloaderService, DownloadRegionService } from '@igo2/core';

export interface TileToDownload {
  url: string;
  coord: [number, number, number];
  templateUrl: string;
  tileGrid;
}

@Component({
  selector: 'igo-region-editor',
  templateUrl: './region-editor.component.html',
  styleUrls: ['./region-editor.component.scss']
})
export class RegionEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('depthSlider') slider: MatSlider;
  private progressBarPlaceHolder: MatProgressBar;
  @ViewChild('progressBar') progressBar;

  regionName: string = this.downloadToolState.regionName;

  urlsToDownload: Set<string> = this.downloadToolState.urlsToDownload;
  tilesToDownload: TileToDownload[] = this.downloadToolState.tilesToDownload;
  depth: number = this.downloadToolState.depth;
  
  progression$: Observable<number>;
  _progression: number = 0;
  
  isDownloading$$: Subscription;
  isDownloading$: Observable<boolean>;
  
  private addNewTile$$: Subscription;

  private _nTilesToDownload: number;
  

  constructor(
    private tileDownloader: TileDownloaderService,
    private regionDB: RegionDBService,
    private downloadService: DownloadRegionService,
    private downloadState: DownloadState,
    private downloadToolState: DownloadToolState,
    private messageService: MessageService
  ) {
    const openedWithMouse = this.downloadState.openedWithMouse;
    const numberToSkip = openedWithMouse ? 0 : 1;
    this.addNewTile$$ = this.downloadState.addNewTile$
      .pipe(skip(numberToSkip))
      .subscribe((tile: TransferedTile) => {
        if (!tile) {
          return;
        }
        this.addTileToDownload(tile.coord, tile.templateUrl, tile.tileGrid);
      });

    this.isDownloading$ = this.tileDownloader.isDownloading$;

    if (!this.downloadToolState.progression$) {
      this.progression$ = this.tileDownloader.progression$
        .pipe(map((value: number) => {
          return Math.round(value / this._nTilesToDownload * 100);
        }));
    } else {
      this.progression$ = this.downloadToolState.progression$;
    }
    
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.slider.value = this.depth;
  }

  ngOnDestroy() {
    this.saveState();
    this.addNewTile$$.unsubscribe();
  }

  private loadState() {
    this.urlsToDownload = this.downloadToolState.urlsToDownload;
    this.tilesToDownload = this.downloadToolState.tilesToDownload;
    this.depth = this.downloadToolState.depth;
  }

  private saveState() {
    this.downloadToolState.depth = this.depth;
    this.downloadToolState.tilesToDownload = this.tilesToDownload;
    this.downloadToolState.urlsToDownload = this.urlsToDownload;
    this.downloadToolState.regionName = this.regionName;
    this.downloadToolState.progression$ = this.progression$;
  }

  addTileToDownload(coord: [number, number, number], templateUrl, tileGrid) {
    try {
      const urlGen = createFromTemplate(templateUrl, tileGrid);
      const url = urlGen(coord, 0, 0);

      const z = coord[0];
      const firstTile = this.tilesToDownload[0];
      if (!firstTile) {
        this.urlsToDownload.add(url);
        this.tilesToDownload.push({ url, coord, templateUrl, tileGrid });
        return;
      }

      const firstZ = firstTile.coord[0];
      if (z !== firstZ) {
        this.messageService.error("The tile you selected is not on the same level as the previous ones");
        return;
      }
      if (!this.urlsToDownload.has(url)) {
        this.urlsToDownload.add(url);
        this.tilesToDownload.push({ url, coord, templateUrl, tileGrid });
      } else {
        this.messageService.error("The tile is already selected");
      }
    } catch (e) {
      return;
    }
  }

  public onDownloadClick() {
    if (this.tilesToDownload.length === 0) {
      return;
    }

    this._nTilesToDownload = this.numberOfTilesToDownload();
    
    if (this.isDownloading$$) {
      this.isDownloading$$.unsubscribe();
    }

    this.isDownloading$$ = this.isDownloading$
      .pipe(skip(1))
      .subscribe((value) => {
        this.downloadToolState.isDownloading = value;
        if (!value) {
          this.messageService.success('Your download is done');
        }
      });
    
    console.log("region name: ", this.regionName);
    this.downloadToolState.updateRegion();
    this.downloadService.downloadSelectedRegion(
      this.tilesToDownload,
      this.regionName,
      this.depth
      );
    
    // for (const tile of this.tilesToDownload) { // change for foreach
    //   this.tileDownloader
    //   .downloadFromCoord(
    //       tile.coord,
    //       this.depth,
    //       tile.tileGrid,
    //       tile.templateUrl,
    //     );
    // }
  }

  public loadRegion(regionID: number) {
    // this.regionDB.get(regionID).pipe(first())
    //   .subscribe(() => {

    //   });
  }

  public onCancelClick() {
    this.tilesToDownload = new Array();
    this.urlsToDownload = new Set();
  }

  public onDepthSliderChange() {
    this.depth = this.slider.value;
  }

  public sizeEstimationInMB() {
    const space = this.tileDownloader.downloadEstimatePerDepth(this.depth);
    const nDownloads = this.tilesToDownload.length;
    return (space * nDownloads * 1e-6).toFixed(4);
  }

  public numberOfTilesToDownload() {
    const nTilesPerDownload = this.tileDownloader.numberOfTiles(this.depth);
    const nDownloads = this.tilesToDownload.length;
    return nTilesPerDownload * nDownloads;
  }

  get isDownloading(): boolean {
    return this.downloadToolState.isDownloading;
  }

  get progression(): number {
    return Math.round(this._progression * 100);
  }

  get disableSlider() {
    return this.downloadToolState.isDownloading || this.tilesToDownload.length === 0;
  }

  get disableDownloadButton() {
    return !this.regionName || this.downloadToolState.isDownloading || this.tilesToDownload.length === 0;
  }

  get disableCancelButton() {
    return this.downloadToolState.isDownloading || this.tilesToDownload.length === 0;
  }
}
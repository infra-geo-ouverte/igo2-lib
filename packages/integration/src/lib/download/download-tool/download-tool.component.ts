import { Component, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlider } from '@angular/material/slider';
import { ToolComponent } from '@igo2/common';
import { LayerListToolService, TileDownloaderService } from '@igo2/geo';
import { createFromTemplate } from 'ol/tileurlfunction.js';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { DownloadState } from '../download.state';
import { TransferedTile } from '../TransferedTile';
import { MessageService } from '@igo2/core';
import { first, map } from 'rxjs/operators';
import { filter } from 'jszip';

// need to do the TODOs in downloadService beforehand
// need to make prototype of the interface
// need to create the all the methods

interface TileToDownload {
  url: string;
  coord: [number, number, number];
  templateUrl: string;
  tileGrid;
}

function getNumberOfTiles(deltaHeight: number) {
  return (Math.pow(4, deltaHeight + 1) - 1) / 3;
}

@ToolComponent({
  name: 'download',
  title: 'igo.integration.tools.download',
  icon: 'share-variant' // testing purposes need to find good icon.
})
@Component({
  selector: 'igo-download-tool',
  templateUrl: './download-tool.component.html',
  styleUrls: ['./download-tool.component.scss']
})
export class DownloadToolComponent implements OnInit {
  @ViewChild('depthSlider') slider: MatSlider;
  private progressBarPlaceHolder: MatProgressBar;
  @ViewChild('progressBar') progressBar;

  urlToDownload: Set<string> = new Set();
  tilesToDownload: TileToDownload[] = [];
  depth: number = 0;
  
  progressionCount$$: Subscription;
  progression$: Observable<number>;
  _progression: number = 0;
  
  isDownloading$$: Subscription;
  isDownloading$: Observable<boolean>;
  private _isDownloading: boolean = false;
  
  private _nTilesToDownload: number;
  
  constructor(
    private downloadService: TileDownloaderService,
    private downloadState: DownloadState,
    private messageService: MessageService 
  ) {
    this.downloadState.addNewTile$.subscribe((tile: TransferedTile) => {
      if (!tile) {
        return;
      }
      this.addTileToDownload(tile.coord, tile.templateUrl, tile.tileGrid);
    });

    // this.progression$ = this.downloadService.progression$
    //                       .pipe(map((value: number) => {
    //                         return value / this._nTilesToDownload;
    //                       }));
    this.isDownloading$ = this.downloadService.isDownloading$;
    this.progression$ = this.downloadService.progression$
        .pipe(map((value: number) => {
          return Math.round(value / this._nTilesToDownload * 100);
        }));               
  }

  ngOnInit() {

  }

  addTileToDownload(coord: [number, number, number], templateUrl, tileGrid) {
    try {
      const urlGen = createFromTemplate(templateUrl, tileGrid);
      const url = urlGen(coord, 0, 0);

      const z = coord[0];
      const firstTile = this.tilesToDownload[0];
      if (!firstTile) {
        this.urlToDownload.add(url);
        this.tilesToDownload.push({ url, coord, templateUrl, tileGrid });
        return;
      }

      const firstZ = firstTile.coord[0];
      if (z !== firstZ) {
        this.messageService.error("The tile you selected is not on the same level as the previous ones");
        // maybe put error message for user in download prompt
        return;
      }
      if (!this.urlToDownload.has(url)) {
        this.urlToDownload.add(url);
        this.tilesToDownload.push({ url, coord, templateUrl, tileGrid });
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
    
    //need to put message when download is done

    for (const tile of this.tilesToDownload) { // change for foreach
      this.downloadService
      .downloadFromCoord(
          tile.coord,
          this.depth,
          tile.tileGrid,
          tile.templateUrl,
        );
    }
  }

  public onCancelClick() {
    this.tilesToDownload = [];
    this.urlToDownload = new Set();
  }

  public onDepthSliderChange() {
    this.depth = this.slider.value;
  }

  public sizeEstimationInMB() {
    const space = this.downloadService.downloadEstimatePerDepth(this.depth);
    const nDownloads = this.tilesToDownload.length;
    return (space * nDownloads * 1e-6).toFixed(4);
  }

  public numberOfTilesToDownload() {
    const nTilesPerDownload = this.downloadService.numberOfTiles(this.depth);
    const nDownloads = this.tilesToDownload.length;
    return nTilesPerDownload * nDownloads;
  }

  get isDownloading(): boolean {
    return this._isDownloading;
  }

  get progression(): number {
    return Math.round(this._progression * 100);
  }

  get disableButton() {
    return this._isDownloading || this.tilesToDownload.length === 0;
  }
}

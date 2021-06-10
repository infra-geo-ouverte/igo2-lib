import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { ToolComponent } from '@igo2/common';
import { LayerListToolService, TileDownloaderService } from '@igo2/geo';
import { timeStamp } from 'console';
import { createFromTemplate } from 'ol/tileurlfunction.js';
import { Subscription } from 'rxjs';
import { ToolState } from '../../tool';
import { DownloadState } from '../download.state';
import { TransferedTile } from '../TransferedTile';

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
  urlToDownload: Set<string> = new Set();
  tilesToDownload: TileToDownload[] = [];
  depth: number = 0;
  progressionCount$$: Subscription;
  private _isDownloading: boolean = false;
  _progression: number = 0;
  private _nTilesToDownload: number;

  constructor(
    private downloadService: TileDownloaderService,
    private downloadState: DownloadState
  ) {
    this.downloadState.addNewTile$.subscribe((tile: TransferedTile) => {
      if (!tile) {
        return;
      }
      console.log('tile received :', tile);
      this.addTileToDownload(tile.coord, tile.templateUrl, tile.tileGrid);
    });
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
    this._isDownloading = true;
    this._nTilesToDownload = this.numberOfTilesToDownload();
    if (!this.progressionCount$$) {
      this.progressionCount$$ = this.downloadService.progression$
        .subscribe((progression: number) => {
          this._progression = progression / this._nTilesToDownload;
          console.log(this._progression);
          if (this._progression === 1) {
            this._isDownloading = false;
            this._progression = 0;
            // message to say download is done
          }
        });
    }

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
    return space * nDownloads * 1e-6;
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

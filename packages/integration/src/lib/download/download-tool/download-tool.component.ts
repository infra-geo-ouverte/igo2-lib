import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSlider } from '@angular/material/slider';
import { ToolComponent } from '@igo2/common';
import { LayerListToolService, TileDownloaderService } from '@igo2/geo';
import { timeStamp } from 'console';
import { createFromTemplate } from 'ol/tileurlfunction.js';
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
  templateUrl: './download-tool.component.html'
})
export class DownloadToolComponent implements OnInit {
  @ViewChild('depthSlider') slider: MatSlider;
  urlToDownload: Set<string> = new Set();
  tilesToDownload: TileToDownload[] = [];
  depth: number = 0;
  constructor(
    private downloadService: TileDownloaderService,
    private downloadState: DownloadState
  ) {
    this.downloadState.addNewTile$.subscribe((tile: TransferedTile) => {
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
}

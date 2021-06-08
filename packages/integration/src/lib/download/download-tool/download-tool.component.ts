import { Component, OnInit } from '@angular/core';
import { ToolComponent } from '@igo2/common';
import { TileDownloaderService } from '@igo2/geo';
import { timeStamp } from 'console';
import { createFromTemplate } from 'ol/tileurlfunction.js';
import { ToolState } from '../../tool';

// need to do the TODOs in downloadService beforehand
// need to make prototype of the interface
// need to create the all the methods

interface TilesToDownload {
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
  icon: 'share-variant' //testing purposes need to find good icon.
})
@Component({
  selector: 'igo-download-tool',
  templateUrl: './download-tool.component.html'
})
export class DownloadToolComponent implements OnInit {
  tilesToDownload: TilesToDownload[] = [];
  constructor(
    private downloadService: TileDownloaderService
  ) { }

  ngOnInit() {
    
  }

  addTileToDownload(coord: [number, number, number], templateUrl, tileGrid) {
    const z = coord[0];
    const firstTile = this.tilesToDownload[0];

    if (!firstTile) {
      return;
    }

    const firstZ = firstTile.coord[0];
    if (z !== firstZ) {
      // maybe put error message for user in download prompt
      return;
    }

    try {
      const urlGen = createFromTemplate(templateUrl, tileGrid);
      const url = urlGen(coord, 0, 0);
      this.tilesToDownload.push({ url, coord, templateUrl, tileGrid })
    } catch(e) {
      return;
    } 
  }

  public onDownloadClick() {
    for (let tile of this.tilesToDownload) {
      this.downloadService
      .downloadFromCoord(
          tile.coord, 
          tile.tileGrid, 
          tile.templateUrl
        );
    }
  }

  public onCancelClick() {
    this.tilesToDownload = [];
  }
}

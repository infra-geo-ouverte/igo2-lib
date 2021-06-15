import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSlider } from '@angular/material/slider';
import { ToolComponent } from '@igo2/common';
import { LayerListToolService } from '@igo2/geo';
import { createFromTemplate } from 'ol/tileurlfunction.js';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { DownloadState } from '../download.state';
import { TransferedTile } from '../TransferedTile';
import { MessageService } from '@igo2/core';
import { first, map, skip, takeUntil, takeWhile } from 'rxjs/operators';
import { filter } from 'jszip';
import { DownloadToolState } from './download-tool.state';
import { MatInput } from '@angular/material/input';
import { TileDownloaderService, DownloadRegionService } from '@igo2/core';
// need to do the TODOs in tileDownloader beforehand
// need to make prototype of the interface
// need to create the all the methods

export interface TileToDownload {
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
  icon: 'download'
})
@Component({
  selector: 'igo-download-tool',
  templateUrl: './download-tool.component.html',
  styleUrls: ['./download-tool.component.scss']
})

export class DownloadToolComponent implements OnInit {
  constructor() {}

  ngOnInit() {

  }
}

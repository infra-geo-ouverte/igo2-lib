import { Component, Input, OnInit } from '@angular/core';
import { DownloadEstimator, DownloadSizeEstimation, DownloadSizeEstimationInBytes, TileGenerationParams, TileToDownload } from '@igo2/core';
import { Geometry } from '@turf/helpers';
import { CreationEditionStrategy, EditionStrategy, UpdateEditionStrategy } from '../editing-strategy';

@Component({
  selector: 'igo-region-download-estimation',
  templateUrl: './region-download-estimation.component.html',
  styleUrls: ['./region-download-estimation.component.scss']
})
export class RegionDownloadEstimationComponent implements OnInit {
  @Input() disabled: boolean = false;

  @Input() tilesToDownload: TileToDownload[];
  @Input() geometries: Geometry[];
  @Input() genParams: TileGenerationParams;
  @Input() tileGrid: any;

  @Input() mode: EditionStrategy = new CreationEditionStrategy();

  _estimation: DownloadSizeEstimation = {
    newAllocatedSize: 0,
    downloadSize: 0
  };

  _estimationInBytes: DownloadSizeEstimationInBytes = {
    newAllocatedSize: 0,
    downloadSize: 0
  };

  estimator: DownloadEstimator = new DownloadEstimator();

  constructor() { }

  ngOnInit() {
  }

  get estimation() {
    if (this.mode instanceof CreationEditionStrategy) {
      this._estimation = this.estimator.estimateRegionDownloadSize(
        this.tilesToDownload,
        this.geometries,
        this.genParams,
        this.tileGrid
      );
    }
    if (this.mode instanceof UpdateEditionStrategy) {
      this._estimation = this.estimator.estimateRegionUpdateSize(
        this.mode.regionToUpdate,
        this.tilesToDownload,
        this.geometries,
        this.tileGrid
      );
    }
    this._estimation = this.removeNaNFromEstimation(this._estimation);
    return this._estimation;
  }

  get estimationInBytes() {
    return this.estimator.downloadSizeEstimationInBytes(this._estimation);
  }

  print() {
    console.log(this.tilesToDownload);
    console.log(this.geometries);
    console.log(this.genParams);
    console.log(this.tileGrid);
    console.log(this.mode);
  }

  removeNaNFromEstimation(estimation: DownloadSizeEstimation): DownloadSizeEstimation {
    if (Number.isNaN(estimation.downloadSize)) {
      estimation.downloadSize = 0;
    }

    if (Number.isNaN(estimation.newAllocatedSize)) {
      estimation.newAllocatedSize = 0;
    }
    return estimation;
  }

  private bytesToMB(sizeInBytes: number): string {
    return (sizeInBytes * 1e-6).toFixed(4);
  }

  get newAllocatedSizeInBytesDisabled(): boolean {
    const newAllocatedSize = this.estimation.newAllocatedSize;
    const downloadSize = this.estimation.downloadSize;
    return newAllocatedSize >= downloadSize || newAllocatedSize === 0;
  }

  get estimationInMB() {
    return {
      newAllocatedSize: this.bytesToMB(this.estimationInBytes.newAllocatedSize),
      downloadSize: this.bytesToMB(this.estimationInBytes.downloadSize)
    };
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { DownloadEstimator, DownloadSizeEstimation, DownloadSizeEstimationInBytes, RegionDBData, TileGenerationParams, TileToDownload } from '@igo2/core';
import { Geometry } from '@turf/helpers';

@Component({
  selector: 'igo-region-download-estimation',
  templateUrl: './region-download-estimation.component.html',
  styleUrls: ['./region-download-estimation.component.scss']
})
export class RegionDownloadEstimationComponent implements OnInit {
  @Input() disabled: boolean = false;

  estimation: DownloadSizeEstimation = {
    newAllocatedSize: 0,
    downloadSize: 0
  };

  estimationInBytes: DownloadSizeEstimationInBytes = {
    newAllocatedSize: 0,
    downloadSize: 0
  };

  estimator: DownloadEstimator = new DownloadEstimator();

  constructor() { }

  ngOnInit() {
  }

  public estimateDownload(
    tileToDownload: TileToDownload[],
    geometries: Geometry[],
    genParams: TileGenerationParams,
    tileGrid: any
  ) {
    this.estimation = this.estimator.estimateRegionDownloadSize(
      tileToDownload,
      geometries,
      genParams,
      tileGrid
    );

    this.estimationInBytes = this.estimator.downloadSizeEstimationInBytes(
      this.estimation
    );
  }

  public estimateUpdate(
    region: RegionDBData,
    tileToDownload: TileToDownload[],
    geometries: Geometry[],
    tileGrid: any
  ) {
    this.estimation = this.estimator.estimateRegionUpdateSize(
      region,
      tileToDownload,
      geometries,
      tileGrid
    );

    this.estimationInBytes = this.estimator.downloadSizeEstimationInBytes(
      this.estimation
    );
  }

  private bytesToMB(sizeInBytes: number): string {
    return (sizeInBytes * 1e-6).toFixed(4);
  }

  get newAllocatedSizeInBytesDisabled(): boolean {
    return this.estimation.newAllocatedSize <= this.estimation.downloadSize;
  }

  get estimationInMB() {
    return {
      newAllocatedSize: this.bytesToMB(this.estimationInBytes.newAllocatedSize),
      downloadSize: this.bytesToMB(this.estimationInBytes.downloadSize)
    };
  }
}

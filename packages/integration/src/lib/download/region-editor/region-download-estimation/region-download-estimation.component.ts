import { Component, Input } from '@angular/core';
import {
  DownloadEstimator, DownloadSizeEstimation, DownloadSizeEstimationInBytes, StorageQuotaService, TileGenerationParams, TileToDownload
} from '@igo2/core';
import { Geometry } from '@turf/helpers';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { CreationEditionStrategy, EditionStrategy, UpdateEditionStrategy } from '../editing-strategy';

@Component({
  selector: 'igo-region-download-estimation',
  templateUrl: './region-download-estimation.component.html',
  styleUrls: ['./region-download-estimation.component.scss']
})
export class RegionDownloadEstimationComponent {
  @Input() disabled: boolean = false;

  @Input() tilesToDownload: TileToDownload[];
  @Input() geometries: Geometry[];
  @Input() genParams: TileGenerationParams;
  @Input() tileGrid: any;

  @Input() mode: EditionStrategy = new CreationEditionStrategy();

  enoughSpace: boolean;
  enoughSpace$: Observable<boolean>;
  private lastNewAllocatedSpace: number;

  _estimation: DownloadSizeEstimation = {
    newAllocatedSize: 0,
    downloadSize: 0
  };

  _estimationInBytes: DownloadSizeEstimationInBytes = {
    newAllocatedSize: 0,
    downloadSize: 0
  };

  estimator: DownloadEstimator = new DownloadEstimator();

  constructor(
    private storageQuota: StorageQuotaService
  ) {}

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
    const newAllocatedSize = this._estimation.newAllocatedSize;
    if (newAllocatedSize !== this.lastNewAllocatedSpace) {
      this.lastNewAllocatedSpace = newAllocatedSize;
      this.enoughSpace$ = this.storageQuota.enoughSpace(newAllocatedSize);
      this.enoughSpace$.pipe(take(1)).subscribe(
        (enoughSpace) => {
          this.enoughSpace = enoughSpace;
        });
    }
    return this._estimation;
  }

  get estimationInBytes() {
    return this.estimator.downloadSizeEstimationInBytes(this._estimation);
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

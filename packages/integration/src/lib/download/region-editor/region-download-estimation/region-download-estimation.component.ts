import { Component, Input, OnInit } from '@angular/core';
import {
  DownloadEstimator, DownloadSizeEstimation, DownloadSizeEstimationInBytes, StorageQuotaService, TileGenerationParams, TileToDownload
} from '@igo2/core';
import { NumberUtils } from '@igo2/utils';

import { Geometry } from '@turf/helpers';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { CreationEditionStrategy, EditionStrategy, UpdateEditionStrategy } from '../editing-strategy';

@Component({
  selector: 'igo-region-download-estimation',
  templateUrl: './region-download-estimation.component.html',
  styleUrls: ['./region-download-estimation.component.scss']
})
export class RegionDownloadEstimationComponent implements OnInit {
  @Input() updateEstimation$: Subject<void> = new Subject();
  @Input() disabled: boolean = false;
  @Input() tilesToDownload: TileToDownload[];
  @Input() geometries: Geometry[];
  @Input() genParams: TileGenerationParams;
  @Input() tileGrid: any;
  @Input() mode: EditionStrategy = new CreationEditionStrategy();
  public estimationInBytes: DownloadSizeEstimationInBytes = {
    newAllocatedSize: 0,
    downloadSize: 0
  };
  public estimationInBestUnit = {
    unit: 'mb',
    downloadSize: 0
  };

  public estimationInMB = {
    newAllocatedSize: 0,
    downloadSize: 0
  };
  public estimation: DownloadSizeEstimation = {
    newAllocatedSize: 0,
    downloadSize: 0
  };
  enoughSpaceObs$: Observable<boolean>;
  enoughSpace$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private lastNewAllocatedSpace: number;

  estimator: DownloadEstimator = new DownloadEstimator();

  get newAllocatedSizeInBytesDisabled(): boolean {
    const newAllocatedSize = this.estimation.newAllocatedSize;
    const downloadSize = this.estimation.downloadSize;
    return newAllocatedSize >= downloadSize || newAllocatedSize === 0;
  }

  constructor(
    private storageQuota: StorageQuotaService
  ) { }
  ngOnInit(): void {
    this.updateEstimation();
    this.updateEstimation$.subscribe(r => {
      this.updateEstimation();
    });
  }

  updateEstimation() {
    if (this.mode instanceof CreationEditionStrategy) {
      this.estimation = this.estimator.estimateRegionDownloadSize(
        this.tilesToDownload,
        this.geometries,
        this.genParams,
        this.tileGrid
      );
    }
    if (this.mode instanceof UpdateEditionStrategy) {
      this.estimation = this.estimator.estimateRegionUpdateSize(
        this.mode.regionToUpdate,
        this.tilesToDownload,
        this.geometries,
        this.tileGrid
        );
    }
    this.estimation = this.removeNaNFromEstimation(this.estimation);
    const newAllocatedSize = this.estimation.newAllocatedSize;
    if (newAllocatedSize !== this.lastNewAllocatedSpace) {
      this.lastNewAllocatedSpace = newAllocatedSize;
    this.estimationInBytes = this.estimator.downloadSizeEstimationInBytes(this.estimation);
    this.enoughSpaceObs$ = this.storageQuota.enoughSpace(this.estimationInBytes.newAllocatedSize);
    this.enoughSpaceObs$.pipe(take(1)).subscribe(
      (enoughSpace) => {
        this.enoughSpace$.next(enoughSpace);
      });
  }
    this.estimationInMB = {
        newAllocatedSize: this.bytesToMB(this.estimationInBytes.newAllocatedSize),
        downloadSize: this.bytesToMB(this.estimationInBytes.downloadSize)
      };


    const ds = this.estimationInMB.downloadSize;
    this.estimationInBestUnit.downloadSize = ds >= 1024 ? this.mbToGb(ds) : ds;
    this.estimationInBestUnit.unit = ds >= 1024 ? 'gb' : 'mb';
  }


  private removeNaNFromEstimation(estimation: DownloadSizeEstimation): DownloadSizeEstimation {
    if (Number.isNaN(estimation.downloadSize)) {
      estimation.downloadSize = 0;
    }

    if (Number.isNaN(estimation.newAllocatedSize)) {
      estimation.newAllocatedSize = 0;
    }
    return estimation;
  }

  private bytesToMB(sizeInBytes: number): number {
    return NumberUtils.roundToNDecimal((sizeInBytes/1024/1024), 1);
  }
  private mbToGb(sizeInMb: number): number {
    return NumberUtils.roundToNDecimal(sizeInMb/1024, 2);
  }
}

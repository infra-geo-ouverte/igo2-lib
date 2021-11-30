import { Injectable, OnDestroy } from '@angular/core';
import { Geometry } from '@turf/helpers';
import { Observable, Subject, Subscription, zip } from 'rxjs';
import { map, skip, takeUntil } from 'rxjs/operators';
import { Region, RegionDBData, RegionDBService, RegionStatus, TileDBData, TileDBService } from '../storage';
import { RegionDBAdminService } from '../storage/region-db/region-db-admin.service';
import { DownloadEstimator } from './download-estimator';
import { RegionUpdateParams, TileToDownload } from './download.interface';
import { TileDownloaderService } from './tile-downloader';
import { TileGenerationParams } from './tile-downloader/tile-generation-strategies';

@Injectable({
  providedIn: 'root'
})
export class DownloadRegionService implements OnDestroy {
  isDownloading$$: Subscription;

  private downloadEstimator = new DownloadEstimator();

  private cancelUnsubscribe$: Subject<void> = new Subject();
  private currentDownloadRegion: RegionDBData;

  constructor(
    private tileDownloader: TileDownloaderService,
    private tileDB: TileDBService,
    private regionDB: RegionDBService,
    private regionDBAdmin: RegionDBAdminService
  ) {
    this.regionDBAdmin.hardUpdate();
  }

  ngOnDestroy() {
    this.cancelUnsubscribe$.next();
    this.cancelUnsubscribe$.complete();
  }

  private updateDownloadedRegionStatus(regionDBData: RegionDBData) {
    const collisionMap = this.tileDB.collisionsMap;
    const validTiles = this.tileDownloader.validDownloadCount;
    const date = new Date();

    regionDBData.status = RegionStatus.OK;
    regionDBData.numberOfTiles = validTiles;
    regionDBData.timestamp = date;

    this.regionDB.update(regionDBData);
    this.regionDB.updateWithCollisions(collisionMap);
    this.tileDB.resetCounters();
  }

  public downloadSelectedRegion(
    tilesToDownload: TileToDownload[],
    regionName: string,
    generationParams: TileGenerationParams,
    tileGrid,
    templateUrl
  ) {
    if (this.isDownloading$$) {
      this.isDownloading$$.unsubscribe();
    }
    const parentUrls = tilesToDownload.map((item: TileToDownload) => {
      return item.url;
    });

    const parentFeatureText = tilesToDownload.map((item: TileToDownload) => {
      return item.featureText;
    });

    const numberOfTiles = this.downloadEstimator.estimateNumberOfTiles(
      tilesToDownload.length,
      generationParams
    );

    const region: Region = {
      name: regionName,
      status: RegionStatus.Downloading,
      parentUrls,
      generationParams,
      numberOfTiles,
      parentFeatureText
    };

    this.regionDB.add(region)
      .subscribe((regionDBData: RegionDBData) => {
        this.currentDownloadRegion = {...regionDBData};
        for (const tile of tilesToDownload) {
          this.tileDownloader.downloadFromCoord(
            tile.coord,
            regionDBData.id,
            generationParams,
            tileGrid,
            templateUrl
          );
        }
        this.isDownloading$$ = this.tileDownloader.isDownloading$
          .pipe(skip(1))
          .subscribe((isDownloading) => {
            if (isDownloading) {
              return;
            }
            this.updateDownloadedRegionStatus(regionDBData);
        });
      });
  }

  downloadRegionFromFeatures(
    featuresText: string[],
    geometries: Geometry[],
    regionName: string,
    generationParams: TileGenerationParams,
    tileGrid,
    templateUrl: string
  ) {
    if (this.isDownloading$$) {
      this.isDownloading$$.unsubscribe();
    }
    const parentUrls = new Array();
    const parentFeatureText = featuresText;
    const numberOfTiles = undefined;

    const region: Region = {
      name: regionName,
      status: RegionStatus.Downloading,
      parentUrls,
      generationParams,
      numberOfTiles,
      parentFeatureText
    };

    this.regionDB.add(region).subscribe((regionDBData: RegionDBData) => {
      this.currentDownloadRegion = {...regionDBData};
      const tiles = this.tileDownloader.downloadFromFeatures(
        geometries,
        regionDBData.id,
        generationParams,
        tileGrid,
        templateUrl
      );
      this.isDownloading$$ = this.tileDownloader.isDownloading$.subscribe(
        (isDownloading) => {
          if (isDownloading) {
            return;
          }
          this.updateDownloadedRegionStatus(regionDBData);
      });
    });
  }

  private updateRegionDBData(
    oldRegion: RegionDBData,
    updateParams: RegionUpdateParams
  ): RegionDBData {
    const region: RegionDBData = oldRegion;
    region.name = updateParams.name;

    const tileToDownload = updateParams.newTiles;
    const newParentUrls = tileToDownload.map((tile) => {
      return tile.url;
    });
    const parentUrls = oldRegion.parentUrls.concat(newParentUrls);
    region.parentUrls = parentUrls;

    const newFeatureText = tileToDownload.map((tile) => {
      return tile.featureText;
    });
    region.parentFeatureText = oldRegion.parentFeatureText.concat(newFeatureText);

    const genParams = oldRegion.generationParams;
    const numberOfTilesToAdd = this.downloadEstimator.estimateNumberOfTiles(
      updateParams.newTiles.length,
      genParams
    );
    region.numberOfTiles += numberOfTilesToAdd;

    region.status = RegionStatus.Downloading;

    this.regionDB.update(region);
    return region;
  }

  public updateRegion(oldRegion: RegionDBData, updateParams: RegionUpdateParams) {
    this.currentDownloadRegion = {...oldRegion};

    const region = this.updateRegionDBData(oldRegion, updateParams);

    const regionID = oldRegion.id;
    const tileToDownload = updateParams.newTiles;
    const generationParams = region.generationParams;
    const templateUrl = updateParams.templateUrl;
    const tileGrid = updateParams.tileGrid;

    for (const tile of tileToDownload) {
      this.tileDownloader.downloadFromCoord(
        tile.coord,
        regionID,
        generationParams,
        tileGrid,
        templateUrl
      );
    }

    const dbRequest = this.tileDB.getRegionByID(regionID)
      .pipe(
        map((tiles: TileDBData[]) => {
          return tiles.map((tile) => tile.url );
        })
      );

    dbRequest.subscribe((urls: string[]) => {
      if (this.isDownloading$$) {
        this.isDownloading$$.unsubscribe();
      }

      this.tileDownloader.downloadFromUrls(urls, regionID);

      this.isDownloading$$ = this.tileDownloader.isDownloading$
        .pipe(skip(1))
        .subscribe((isDownloading) => {
          if (isDownloading) {
            return;
          }
          this.updateDownloadedRegionStatus(region);
        });
    });
  }

  public deleteRegionByID(regionID: number): Observable<[boolean, boolean]> {
    if (!regionID) {
      return;
    }

    const regionDBRequest = this.regionDB.deleteByRegionID(regionID);
    const tileDBRequest = this.tileDB.deleteByRegionID(regionID);
    return zip(regionDBRequest, tileDBRequest);
  }

  public cancelRegionDownload() {
    const cancel$ = this.tileDownloader.cancelDownload();
    this.isDownloading$$.unsubscribe();
    cancel$.pipe(takeUntil(this.cancelUnsubscribe$)).subscribe(
      (canceled) => {
        if (canceled) {
          this.deleteRegionByID(this.currentDownloadRegion.id);

          this.tileDB.revertCollisions();
          this.tileDB.resetCounters();

          this.cancelUnsubscribe$.next();
        }
      });
  }

  public cancelRegionUpdate() {
    const cancel$ = this.tileDownloader.cancelDownload();
    this.isDownloading$$.unsubscribe();
    cancel$.pipe(takeUntil(this.cancelUnsubscribe$)).subscribe(
      (canceled) => {
        if (canceled) {
          this.regionDB.getByID(this.currentDownloadRegion.id)
            .subscribe((region: RegionDBData) => {
              region.numberOfTiles += this.tileDB.newTiles;
              region.status = this.currentDownloadRegion.status;

              this.regionDB.update(region);
              this.tileDB.revertCollisions();
              this.tileDB.resetCounters();

              this.cancelUnsubscribe$.next();
            });
        }
      });
  }
}

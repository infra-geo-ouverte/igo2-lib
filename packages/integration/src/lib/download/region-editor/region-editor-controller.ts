import { ChangeDetectorRef } from '@angular/core';
import { DownloadRegionService, RegionDBData } from '@igo2/core';
import { GeoJSONGeometry, XYZDataSource } from '@igo2/geo';
import { createFromTemplate } from 'ol/tileurlfunction.js';
import { DownloadState } from '../download.state';
import { CreationEditionStrategy, UpdateEditionStrategy } from './editing-strategy';
import { RegionEditorControllerBase } from './region-editor-controller-base';
import { AddTileError, AddTileErrors, geoJSONToFeature, getTileFeature } from './region-editor-utils';
import { RegionEditorState } from './region-editor.state';

export class RegionEditorController extends RegionEditorControllerBase {

    constructor(
        state: RegionEditorState,
        downloadState: DownloadState,
        private cdReg: ChangeDetectorRef
    ) {
        super(downloadState, state);
    }

    addTileToDownload(coord: [number, number, number], templateUrl, tileGrid) {
        if (this.regionStore.index.size && this.tilesToDownload.length === 0) {
            return;
        }
        const urlGen = createFromTemplate(templateUrl, tileGrid);
        const url = urlGen(coord, 0, 0);
        const z = coord[0];
        const first: boolean = this.parentTileUrls.length === 0;
        const parentLevel = this.genParams.parentLevel;
        if (first) {
            this.parentLevel = z;
            this.tileGrid = tileGrid;
            this.templateUrl = templateUrl;
        }

        if (!first && tileGrid !== this.tileGrid
          && templateUrl !== this.templateUrl
        ) {
            throw new AddTileError(AddTileErrors.CARTO_BACKGROUND);
        }

        if (z !== this.parentLevel && !first) {
            console.log('parentlevel:', parentLevel, 'z:', z, 'genParams:', this.genParams);
            throw new AddTileError(AddTileErrors.LEVEL);
        }

        if (!this.urlsToDownload.has(url) || first) {
            this.urlsToDownload.add(url);

            const feature = getTileFeature(
                tileGrid,
                coord,
                this.regionStore,
                this.igoMap.projection
            );
            const featureText = JSON.stringify(feature);

            this.editedTilesFeature.push(feature);
            this.tilesToDownload.push({ url, coord, featureText});
            this.parentTileUrls.push(url);
            console.log('genParams after addTile', this.genParams);
        } else {
            throw new AddTileError(AddTileErrors.ALREADY_SELECTED);
        }
    }

    public loadGeoJSON(geometry: GeoJSONGeometry) {
        const geoJSONFeatures = [
            geoJSONToFeature(geometry, this.regionStore, this.igoMap.projection)
        ];
        this.editedRegion.features = geoJSONFeatures;
    }

    public updateRegion(region: RegionDBData) {
        if (!region) {
          return;
        }

        if (this.isDownloading) {
            throw new AddTileError(AddTileErrors.ALREADY_DOWNLOADING);
        }
        this.clearEditedRegion();
        this.loadEditedRegion(region);
        this.editionStrategy = new UpdateEditionStrategy(region);
    }

    private clearEditedRegion() {
        this.editedRegion = undefined;
        this.parentTileUrls = new Array();
        this.editionStrategy = new CreationEditionStrategy();
        this.regionStore.clear();
    }

    private loadEditedRegion(region: RegionDBData) {
        region.parentUrls.forEach((url: string) => {
          this.parentTileUrls.push(url);
          this.urlsToDownload.add(url);
        });
        this.regionName = region.name;

        this.parentLevel = region.generationParams.parentLevel;
        this.genParams = region.generationParams;
        this.editedTilesFeature = region.parentFeatureText.map((featureText) => {
          return JSON.parse(featureText);
        });
    }

    public setTileGridAndTemplateUrl() {
        const baseLayer = this.igoMap.getBaseLayers();
        baseLayer.forEach((layer) => {
          if (!layer.visible) {
            return;
          }
          if (!(layer.dataSource instanceof XYZDataSource)) {
            return;
          }
          this.templateUrl = layer.dataSource.options.url;
          this.tileGrid = layer.ol.getSource().tileGrid;
        });
    }

    // TODO
    public downloadEditedRegion(downloadService: DownloadRegionService) {
        this.editionStrategy.download(this.editedRegion, downloadService);
    }

    public cancelDownload(downloadService: DownloadRegionService) {
        this.editionStrategy.cancelDownload(downloadService);
    }

    public clear() {
        this.drawnRegionGeometryForm.reset();
        this.regionStore.clear();
        this.clearEditedRegion();
    }
}

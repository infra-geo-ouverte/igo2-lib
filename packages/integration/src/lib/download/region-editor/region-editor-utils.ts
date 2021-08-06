import { Feature, FEATURE, FeatureStore } from '@igo2/geo';
import { uuid } from '@igo2/utils';
import OlFeature from 'ol/Feature';
import * as olformat from 'ol/format';
import { fromExtent } from 'ol/geom/Polygon';

export enum AddTileErrors {
    CARTO_BACKGROUND = 'Cartographic Background is not the same',
    LEVEL = 'Tile to add not on the same level of those selected',
    ALREADY_SELECTED = 'The tile is already selected',
    ALREADY_DOWNLOADING = 'Region already downloading'
}

export class AddTileError extends Error {

    constructor(readonly addTileError: AddTileErrors) {
        super(addTileError);
    }

} 

export function getTileFeature(
    tileGrid,
    coord: [number, number, number],
    regionStore: FeatureStore,
    map
): Feature {
    const id = uuid();
    const previousRegion = regionStore.get(id);
    const previousRegionRevision = previousRegion ? previousRegion.meta.revision : 0;

    const polygonGeometry = fromExtent(tileGrid.getTileCoordExtent(coord));

    const feature: OlFeature = new OlFeature(polygonGeometry);

    const projectionIn = 'EPSG:4326';
    const projectionOut = 'EPSG:4326';

    const featuresText: string = new olformat.GeoJSON().writeFeature(
        feature,
        {
            dataProjection: projectionOut,
            featureProjection: projectionIn,
            featureType: 'feature',
            featureNS: 'http://example.com/feature'
        }
    );

    const regionFeature: Feature = {
        type: FEATURE,
        geometry: JSON.parse(featuresText).geometry,
        projection: map.projection,
        properties: {
            id,
            stopOpacity: 1
        },
        meta: {
            id,
            revision: previousRegionRevision + 1
        },
        ol: feature
    };
    return regionFeature;
}

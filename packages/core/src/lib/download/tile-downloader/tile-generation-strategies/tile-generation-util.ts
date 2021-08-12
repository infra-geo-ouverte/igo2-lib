import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { Geometry } from '@turf/helpers';
import intersect from '@turf/intersect';
import lineIntersect from '@turf/line-intersect';
import { LineString, Polygon } from 'geojson';
import OlFeature from 'ol/Feature';
import * as olformat from 'ol/format';
import { fromExtent } from 'ol/geom/Polygon';
import { Tile } from '../../Tile.interface';

export function zoom(tile: Tile): Tile[] {
    const x0 = 2 * tile.X;
    const y0 = 2 * tile.Y;
    const z = tile.Z + 1;
    const tiles: Tile[] = [];
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            tiles.push({X: x0 + i, Y: y0 + j, Z: z} as Tile);
        }
    }
    return tiles;
}

export function deZoom(tile: Tile): Tile {
  if (tile.Z === 0) {
    return;
  }

  const X = Math.floor(tile.X / 2);
  const Y = Math.floor(tile.Y / 2);
  const Z = tile.Z - 1;

  return { X, Y, Z };
}

export function getTreeNodes(root: Tile, maxLevel: number) {
  if (root.Z === maxLevel) {
    return [root];
  }

  const children = zoom(root);
  let nextChildren: Tile[] = [];
  children.forEach((child) => {
    nextChildren = nextChildren.concat(getTreeNodes(child, maxLevel));
  });
  return [root].concat(nextChildren);
}

export function getParent(tile: Tile): Tile {
  return deZoom(tile);
}

export function getNumberOfTreeNodes(deltaHeight: number) {
  return (Math.pow(4, deltaHeight + 1) - 1) / 3;
}

// TODO fix proj
export function getTileGeometry(tile: Tile, tileGrid): Polygon {
  const tileGeometry = fromExtent(tileGrid.getTileCoordExtent([tile.Z, tile.X, tile.Y]));
  console.log(tileGeometry);
  const feature: OlFeature = new OlFeature(tileGeometry);

  const projectionIn = 'EPSG:4326';
  const projectionOut = 'EPSG:4326';

  const featureText = new olformat.GeoJSON().writeFeature(
    feature,
    {
      dataProjection: projectionOut,
      featureProjection: projectionIn,
      featureType: 'feature',
      featureNS: 'http://example.com/feature'
    }
  );
  return JSON.parse(featureText).geometry;
}

export function isPolygonIntersect(polygon: Polygon, tileGeometry: Polygon): boolean {
  try {
    const intersection = intersect(polygon, tileGeometry);
    if (!intersection) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function isLineIntersect(lineString: LineString, tileGeometry: Polygon): boolean {
  try {
    const intersection = lineIntersect(tileGeometry, lineString);
    const features = intersection.features;
    if (features.length === 0) {
      const startPoint = lineString.coordinates[0];
      const endPoint = lineString.coordinates[1];
      if (booleanPointInPolygon(startPoint, tileGeometry)
        || booleanPointInPolygon(endPoint, tileGeometry)
      ) {
        return true;
      }
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function tileInsidePolygon(polygon: Geometry, tile: Tile, tileGrid): boolean {
  const tileGeometry = getTileGeometry(tile, tileGrid);
  switch (polygon.type) {
    case 'Polygon':
      return isPolygonIntersect(polygon as Polygon, tileGeometry);
    case 'LineString':
      return isLineIntersect(polygon as LineString, tileGeometry);
  }
}

export interface DxDyPolygon {
  dx: number;
  dy: number;
}

export function findDxDyOfPolygon(polygon: Polygon): DxDyPolygon {
  const coords = polygon.coordinates;
  const MAX_VALUE = Number.MAX_VALUE;
  const MIN_VALUE = -Number.MAX_VALUE;
  let maxX = MIN_VALUE;
  let minX = MAX_VALUE;

  let maxY = MIN_VALUE;
  let minY = MAX_VALUE;
  for (const point of coords[0]) {
      const x: number = point[0];
      const y: number = point[1];

      maxX = Math.max(maxX, x);
      minX = Math.min(minX, x);

      maxY = Math.max(maxY, y);
      minY = Math.min(minY, y);
  }
  const dx = maxX - minX;
  const dy = maxY - minY;
  return {
      dx,
      dy
  };
}

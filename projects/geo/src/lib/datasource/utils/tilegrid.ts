import WMTSTileGrid from 'ol/tilegrid/WMTS';
import { get as getProj } from 'ol/proj.js';
import {
  getTopLeft as extentGetTopLeft,
  getWidth as extentGetWidth
} from 'ol/extent.js';

export function createDefaultTileGrid(epsg?: string): WMTSTileGrid {
  const projection = epsg ? getProj(epsg) : getProj('EPSG:3857');
  const projectionExtent = projection.getExtent();
  const size = extentGetWidth(projectionExtent) / 256;
  const resolutions = new Array(20);
  const matrixIds = new Array(20);
  for (let z = 0; z < 20; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
  }

  return new WMTSTileGrid({
    origin: extentGetTopLeft(projectionExtent),
    resolutions: resolutions,
    matrixIds: matrixIds
  });
}

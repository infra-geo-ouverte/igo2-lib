import {
  getTopLeft as extentGetTopLeft,
  getWidth as extentGetWidth
} from 'ol/extent.js';
import * as olproj from 'ol/proj';
import olTileGridWMTS from 'ol/tilegrid/WMTS';

export function createDefaultTileGrid(epsg?: string): olTileGridWMTS {
  const projection = epsg ? olproj.get(epsg) : olproj.get('EPSG:3857');
  const projectionExtent = projection.getExtent();
  const size = extentGetWidth(projectionExtent) / 256;
  const resolutions = new Array(20);
  const matrixIds = new Array(20);
  for (let z = 0; z < 20; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
  }

  return new olTileGridWMTS({
    origin: extentGetTopLeft(projectionExtent),
    resolutions,
    matrixIds
  });
}

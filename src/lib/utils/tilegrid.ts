import WMTS from 'ol/tilegrid/wmts';
import proj from 'ol/proj';
import extent from 'ol/extent';


export function createDefaultTileGrid(epsg?: string): WMTS {
  const projection = epsg ? proj.get(epsg) : proj.get('EPSG:3857');
  const projectionExtent = projection.getExtent();
  const size = extent.getWidth(projectionExtent) / 256;
  const resolutions = new Array(20);
  const matrixIds = new Array(20);
  for (let z = 0; z < 20; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
  }

  return new WMTS({
    origin: extent.getTopLeft(projectionExtent),
    resolutions: resolutions,
    matrixIds: matrixIds
  });
}

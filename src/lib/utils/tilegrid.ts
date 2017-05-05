export function createDefaultTileGrid(epsg?: string): ol.tilegrid.WMTS {
  const projection = epsg ? ol.proj.get(epsg) : ol.proj.get('EPSG:3857');
  const projectionExtent = projection.getExtent();
  const size = ol.extent.getWidth(projectionExtent) / 256;
  const resolutions = new Array(20);
  const matrixIds = new Array(20);
  for (let z = 0; z < 20; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
  }

  return new ol.tilegrid.WMTS({
    origin: ol.extent.getTopLeft(projectionExtent),
    resolutions: resolutions,
    matrixIds: matrixIds
  });
}

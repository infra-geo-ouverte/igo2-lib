import { IgoMap } from '../../map';

export const createTestIgoMap = () => {
  return new IgoMap({
    view: {
      projection: 'EPSG:3857',
      center: [-71.938087, 48.446975],
      zoom: 6,
      maxZoom: 19,
      maxZoomOnExtent: 17
    }
  });
};

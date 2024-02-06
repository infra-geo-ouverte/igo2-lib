import { generateIdFromSourceOptions } from '../../../utils/id-generator';
import {
  AnyDataSourceOptions,
  InfoFromSourceOptions
} from './any-datasource.interface';
import { ArcGISRestDataSourceOptions } from './arcgisrest-datasource.interface';
import { CartoDataSourceOptions } from './carto-datasource.interface';
import { ClusterDataSourceOptions } from './cluster-datasource.interface';
import { FeatureDataSourceOptions } from './feature-datasource.interface';
import { MVTDataSourceOptions } from './mvt-datasource.interface';
import { OSMDataSourceOptions } from './osm-datasource.interface';
import { WFSDataSourceOptions } from './wfs-datasource.interface';
import { WMSDataSourceOptions } from './wms-datasource.interface';
import { WMTSDataSourceOptions } from './wmts-datasource.interface';
import { XYZDataSourceOptions } from './xyz-datasource.interface';

export function getInfoFromSourceOptions(
  sourceOptions: AnyDataSourceOptions,
  context?: string
): InfoFromSourceOptions {
  const infoFromSourceOptions: InfoFromSourceOptions = {
    id: undefined,
    layerName: undefined,
    url: undefined,
    sourceOptions: undefined,
    context
  };

  switch (sourceOptions.type) {
    case 'imagearcgisrest':
    case 'arcgisrest':
    case 'tilearcgisrest':
      const argisSo = sourceOptions as ArcGISRestDataSourceOptions;
      infoFromSourceOptions.layerName = argisSo.layer;
      infoFromSourceOptions.url = argisSo.url;
      infoFromSourceOptions.sourceOptions = argisSo;
      break;
    case 'wmts':
      const wmtsSo = sourceOptions as WMTSDataSourceOptions;
      infoFromSourceOptions.layerName = wmtsSo.layer;
      infoFromSourceOptions.url = wmtsSo.url;
      infoFromSourceOptions.sourceOptions = wmtsSo;
      break;
    case 'xyz':
      const xyzSo = sourceOptions as XYZDataSourceOptions;
      infoFromSourceOptions.layerName = '';
      infoFromSourceOptions.url = xyzSo.url;
      infoFromSourceOptions.sourceOptions = xyzSo;
      break;
    case 'wms':
      const wmsSo = sourceOptions as WMSDataSourceOptions;
      wmsSo.params.LAYERS = wmsSo.params.LAYERS ?? (wmsSo.params as any).layers;
      infoFromSourceOptions.layerName = wmsSo.params.LAYERS;

      infoFromSourceOptions.url = wmsSo.url;
      infoFromSourceOptions.sourceOptions = wmsSo;
      break;
    case 'osm':
      const osmSo = sourceOptions as OSMDataSourceOptions;
      infoFromSourceOptions.layerName = '';
      infoFromSourceOptions.url = osmSo.url
        ? osmSo.url
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      infoFromSourceOptions.sourceOptions = osmSo;
      break;
    case 'wfs':
      const wfsSo = sourceOptions as WFSDataSourceOptions;
      infoFromSourceOptions.layerName = wfsSo.params.featureTypes;
      infoFromSourceOptions.url = wfsSo.url;
      infoFromSourceOptions.sourceOptions = wfsSo;
      break;
    case 'vector':
      const featureSo = sourceOptions as FeatureDataSourceOptions;
      infoFromSourceOptions.layerName = '';
      infoFromSourceOptions.url = featureSo.url;
      infoFromSourceOptions.sourceOptions = featureSo;
      break;
    case 'cluster':
      const clusterSo = sourceOptions as ClusterDataSourceOptions;
      infoFromSourceOptions.layerName = '';
      infoFromSourceOptions.url = clusterSo.url;
      infoFromSourceOptions.sourceOptions = clusterSo;
      break;
    case 'mvt':
      const mvtSo = sourceOptions as MVTDataSourceOptions;
      infoFromSourceOptions.layerName = '';
      infoFromSourceOptions.url = mvtSo.url;
      infoFromSourceOptions.sourceOptions = mvtSo;
      break;
    case 'carto':
      const cartoSo = sourceOptions as CartoDataSourceOptions;
      infoFromSourceOptions.layerName = cartoSo.config.layers
        .map((layer) => layer.options.sql)
        .join(' ');
      infoFromSourceOptions.url = `https://${cartoSo.account}.carto.com/api/v1/map`;
      infoFromSourceOptions.sourceOptions = cartoSo;
      break;
    default:
      break;
  }
  if (infoFromSourceOptions.sourceOptions) {
    infoFromSourceOptions.id = generateIdFromSourceOptions(
      infoFromSourceOptions.sourceOptions
    );
    infoFromSourceOptions.url = infoFromSourceOptions.url?.startsWith('/')
      ? window.location.origin + infoFromSourceOptions.url
      : infoFromSourceOptions.url;
  }

  return infoFromSourceOptions;
}

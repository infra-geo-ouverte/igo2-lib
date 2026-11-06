import type { WFSDataSource } from '../../datasource/shared/datasources/wfs-datasource';
import type { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import type {
  IgoOgcFilterObject,
  OgcFilterableDataSourceOptions
} from '../../filter/shared/ogc-filter.interface';
import { OgcFilterTarget } from '../application';
import { ogcFilterNodeToJson } from '../serialization';

/**
 * WMS target: applies the encoded filter through the vendor `FILTER`
 * parameter of the GetMap request.
 */
export function createWmsOgcFilterTarget(
  dataSource: WMSDataSource
): OgcFilterTarget {
  return {
    protocol: 'wms',
    get layerNames(): readonly string[] {
      return String(dataSource.params.LAYERS ?? '').split(',');
    },
    applyOgcFilter: ({ encoded }) => {
      dataSource.ol.updateParams({ FILTER: encoded });
    }
  };
}

/**
 * WFS target.
 *
 * @transitional The legacy WFS loading strategy (`buildUrl`) rebuilds its
 * query string from `options.ogcFilters` on every load, so the state is
 * bridged back to the legacy options before refreshing. Once the loading
 * strategy consumes `encodeWfsOgcFilterParam` directly, this writeback
 * disappears.
 */
export function createWfsOgcFilterTarget(
  dataSource: WFSDataSource
): OgcFilterTarget {
  return {
    protocol: 'wfs',
    get layerNames(): readonly string[] {
      return [dataSource.options.paramsWFS?.featureTypes ?? ''];
    },
    applyOgcFilter: ({ node }) => {
      const options = dataSource.options as OgcFilterableDataSourceOptions;
      options.ogcFilters = {
        ...options.ogcFilters,
        enabled: node !== undefined,
        advancedOgcFilters: true,
        interfaceOgcFilters: [],
        filters: node
          ? (ogcFilterNodeToJson(node) as unknown as IgoOgcFilterObject)
          : undefined
      };
      dataSource.ol.refresh();
    }
  };
}

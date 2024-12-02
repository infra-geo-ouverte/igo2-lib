import {
  AnyDataSourceOptions,
  ArcGISRestDataSourceOptions,
  CartoDataSourceOptions,
  ClusterDataSourceOptions,
  FeatureDataSourceOptions,
  MVTDataSourceOptions,
  OSMDataSourceOptions,
  WFSDataSourceOptions,
  WMSDataSourceOptions,
  WMTSDataSourceOptions,
  XYZDataSourceOptions,
  generateIdFromSourceOptions
} from '@igo2/geo';

import type { ColInfo, WorkBook } from 'xlsx';

import {
  InfoFromSourceOptions,
  ListExport
} from './catalog-library-tool.interface';

export function getColumnsInfo(rows: ListExport[]): ColInfo[] {
  const columns = Object.keys(rows[0]);
  return columns.map((column) => ({
    wch: getColumnMaxWidth(column, rows)
  }));
}

export function getColumnMaxWidth(column: string, rows: ListExport[]): number {
  return rows.reduce(
    (width, row) => Math.max(width, row[column]?.length ?? 0),
    column.length
  );
}

export async function addExcelSheet(
  title: string,
  rows: ListExport[],
  workbook: WorkBook,
  skipHeader = true
): Promise<void> {
  const { utils } = await import('xlsx');

  const worksheet = utils.json_to_sheet(rows, { skipHeader: skipHeader });

  /* calculate column width */
  if (rows?.length) {
    worksheet['!cols'] = getColumnsInfo(rows);
  }

  const SHEET_NAME_MAX_LENGTH = 31;
  let sheetName =
    title.length >= SHEET_NAME_MAX_LENGTH
      ? title.substring(0, SHEET_NAME_MAX_LENGTH)
      : title;

  if (workbook.SheetNames.includes(sheetName)) {
    sheetName = `${sheetName.substring(0, SHEET_NAME_MAX_LENGTH - 3)}_${workbook.SheetNames.length}`;
  }

  utils.book_append_sheet(workbook, worksheet, sheetName);
}

export function getInfoFromSourceOptions(
  sourceOptions: AnyDataSourceOptions,
  context: string
): InfoFromSourceOptions {
  const value: InfoFromSourceOptions = {
    id: undefined,
    layerName: undefined,
    url: undefined,
    sourceOptions: undefined,
    context
  };

  switch (sourceOptions.type) {
    case 'imagearcgisrest':
    case 'arcgisrest':
    case 'tilearcgisrest': {
      const argisSo = sourceOptions as ArcGISRestDataSourceOptions;
      value.layerName = argisSo.layer;
      value.url = argisSo.url;
      value.sourceOptions = argisSo;
      break;
    }
    case 'wmts': {
      const wmtsSo = sourceOptions as WMTSDataSourceOptions;
      value.layerName = wmtsSo.layer;
      value.url = wmtsSo.url;
      value.sourceOptions = wmtsSo;
      break;
    }
    case 'xyz': {
      const xyzSo = sourceOptions as XYZDataSourceOptions;
      value.layerName = '';
      value.url = xyzSo.url;
      value.sourceOptions = xyzSo;
      break;
    }
    case 'wms': {
      const wmsSo = sourceOptions as WMSDataSourceOptions;
      wmsSo.params.LAYERS = wmsSo.params.LAYERS ?? (wmsSo.params as any).layers;
      value.layerName = wmsSo.params.LAYERS;

      value.url = wmsSo.url;
      value.sourceOptions = wmsSo;
      break;
    }
    case 'osm': {
      const osmSo = sourceOptions as OSMDataSourceOptions;
      value.layerName = '';
      value.url = osmSo.url
        ? osmSo.url
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      value.sourceOptions = osmSo;
      break;
    }
    case 'wfs': {
      const wfsSo = sourceOptions as WFSDataSourceOptions;
      value.layerName = wfsSo.params.featureTypes;
      value.url = wfsSo.url;
      value.sourceOptions = wfsSo;
      break;
    }
    case 'vector': {
      const featureSo = sourceOptions as FeatureDataSourceOptions;
      value.layerName = '';
      value.url = featureSo.url;
      value.sourceOptions = featureSo;
      break;
    }
    case 'cluster': {
      const clusterSo = sourceOptions as ClusterDataSourceOptions;
      value.layerName = '';
      value.url = clusterSo.url;
      value.sourceOptions = clusterSo;
      break;
    }
    case 'mvt': {
      const mvtSo = sourceOptions as MVTDataSourceOptions;
      value.layerName = '';
      value.url = mvtSo.url;
      value.sourceOptions = mvtSo;
      break;
    }
    case 'carto': {
      const cartoSo = sourceOptions as CartoDataSourceOptions;
      value.layerName = cartoSo.config.layers
        .map((layer) => layer.options.sql)
        .join(' ');
      value.url = `https://${cartoSo.account}.carto.com/api/v1/map`;
      value.sourceOptions = cartoSo;
      break;
    }
    default:
      break;
  }
  if (value.sourceOptions) {
    value.id = generateIdFromSourceOptions(value.sourceOptions);
    value.url = value.url?.startsWith('/')
      ? window.location.origin + value.url
      : value.url;
  }

  return value;
}

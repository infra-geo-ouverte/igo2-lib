import { DataSourceOptions } from './datasource.interface';
import olSourceVector from 'ol/source/Vector';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import { FeatureDataSourceOptions } from './feature-datasource.interface';

export interface WFSDataSourceOptions extends FeatureDataSourceOptions {
  // type?: 'wfs';
  params: WFSDataSourceOptionsParams; // Used by user
  paramsWFS?: WFSDataSourceOptionsParams; // Used by code
  urlWfs?: string; // Used by code
  ol?: olSourceVector<OlGeometry>;
}

// TODO: Are those WFS protocol params or something else? This is not clear
export interface WFSDataSourceOptionsParams {
  version?: string;
  featureTypes: string;
  fieldNameGeometry: string;
  maxFeatures?: number;
  outputFormat: string;
  outputFormatDownload?: string;
  srsName?: string;
  xmlFilter?: string;
}

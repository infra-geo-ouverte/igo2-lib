import * as ol from 'openlayers';
import { LayerOptions } from './layer.interface';

import { OSMDataSourceOptions } from '../../../datasource/shared/datasources/osm-datasource.interface';
import { WMTSDataSourceOptions } from '../../../datasource/shared/datasources/wmts-datasource.interface';
import { XYZDataSourceOptions } from '../../../datasource/shared/datasources/xyz-datasource.interface';

export interface TileLayerOptions
  extends LayerOptions,
    ol.olx.layer.TileOptions {
  source:
    | OSMDataSourceOptions
    | WMTSDataSourceOptions
    | XYZDataSourceOptions
    | any;
}

import olLayerTile from 'ol/layer/Tile';

import { LayerOptions } from './layer.interface';

import { OSMDataSource } from '../../../datasource/shared/datasources/osm-datasource';
import { WMTSDataSource } from '../../../datasource/shared/datasources/wmts-datasource';
import { XYZDataSource } from '../../../datasource/shared/datasources/xyz-datasource';

import { OSMDataSourceOptions } from '../../../datasource/shared/datasources/osm-datasource.interface';
import { WMTSDataSourceOptions } from '../../../datasource/shared/datasources/wmts-datasource.interface';
import { XYZDataSourceOptions } from '../../../datasource/shared/datasources/xyz-datasource.interface';

export interface TileLayerOptions extends LayerOptions {
  source?: OSMDataSource | WMTSDataSource | XYZDataSource;
  sourceOptions?:
    | OSMDataSourceOptions
    | WMTSDataSourceOptions
    | XYZDataSourceOptions;
  ol?: olLayerTile;
}

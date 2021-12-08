import olLayerTile from 'ol/layer/Tile';
import olSourceTile from 'ol/source/Tile';

import { LayerOptions } from './layer.interface';

import { OSMDataSource } from '../../../datasource/shared/datasources/osm-datasource';
import { WMTSDataSource } from '../../../datasource/shared/datasources/wmts-datasource';
import { XYZDataSource } from '../../../datasource/shared/datasources/xyz-datasource';
import { CartoDataSource } from '../../../datasource/shared/datasources/carto-datasource';
import { TileArcGISRestDataSource } from '../../../datasource/shared/datasources/tilearcgisrest-datasource';
import { TileDebugDataSource } from '../../../datasource/shared/datasources/tiledebug-datasource';

import { OSMDataSourceOptions } from '../../../datasource/shared/datasources/osm-datasource.interface';
import { WMTSDataSourceOptions } from '../../../datasource/shared/datasources/wmts-datasource.interface';
import { XYZDataSourceOptions } from '../../../datasource/shared/datasources/xyz-datasource.interface';
import { CartoDataSourceOptions } from '../../../datasource/shared/datasources/carto-datasource.interface';
import { TileArcGISRestDataSourceOptions } from '../../../datasource/shared/datasources/tilearcgisrest-datasource.interface';
import { TileDebugDataSourceOptions } from '../../../datasource/shared/datasources/tiledebug-datasource.interface';

export interface TileLayerOptions extends LayerOptions {
  source?:
    | OSMDataSource
    | WMTSDataSource
    | XYZDataSource
    | TileDebugDataSource
    | CartoDataSource
    | TileArcGISRestDataSource;
  sourceOptions?:
    | OSMDataSourceOptions
    | WMTSDataSourceOptions
    | XYZDataSourceOptions
    | TileDebugDataSourceOptions
    | CartoDataSourceOptions
    | TileArcGISRestDataSourceOptions;
  ol?: olLayerTile<olSourceTile>;
  offlinable?: boolean;
}

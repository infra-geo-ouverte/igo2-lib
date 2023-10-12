import olLayerTile from 'ol/layer/Tile';
import olSourceTile from 'ol/source/Tile';

import { CartoDataSource } from '../../../datasource/shared/datasources/carto-datasource';
import { CartoDataSourceOptions } from '../../../datasource/shared/datasources/carto-datasource.interface';
import { OSMDataSource } from '../../../datasource/shared/datasources/osm-datasource';
import { OSMDataSourceOptions } from '../../../datasource/shared/datasources/osm-datasource.interface';
import { TileArcGISRestDataSource } from '../../../datasource/shared/datasources/tilearcgisrest-datasource';
import { TileArcGISRestDataSourceOptions } from '../../../datasource/shared/datasources/tilearcgisrest-datasource.interface';
import { TileDebugDataSource } from '../../../datasource/shared/datasources/tiledebug-datasource';
import { TileDebugDataSourceOptions } from '../../../datasource/shared/datasources/tiledebug-datasource.interface';
import { WMTSDataSource } from '../../../datasource/shared/datasources/wmts-datasource';
import { WMTSDataSourceOptions } from '../../../datasource/shared/datasources/wmts-datasource.interface';
import { XYZDataSource } from '../../../datasource/shared/datasources/xyz-datasource';
import { XYZDataSourceOptions } from '../../../datasource/shared/datasources/xyz-datasource.interface';
import { LayerOptions } from './layer.interface';

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
}

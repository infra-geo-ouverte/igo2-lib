import * as ol from "openlayers";
import {
  DataSourceOptions,
  DataSourceContext,
  QueryableDataSourceOptions
} from "./datasource.interface";

export interface TileArcGISRestDataSourceOptions
  extends DataSourceOptions,
    ol.olx.source.TileArcGISRestOptions,
    QueryableDataSourceOptions {
  queryPrecision?: number;
}

export interface TileArcGISRestDataSourceContext extends DataSourceContext {}

import { CatalogServiceOptions } from '../catalog';
import { OptionsApiOptions } from '../datasource';
import { DirectionsSourceOptions } from '../directions';
import { SpatialFilterOptions } from '../filter';
import { ImportExportServiceOptions } from '../import-export';
import { Projection } from '../map';
import {
  SearchSourceOptions,
  StoredQueriesReverseSearchSourceOptions,
  StoredQueriesSearchSourceOptions
} from '../search';
import { CommonVectorStyleOptions } from '../style';

export interface GeoOptions {
  catalog?: CatalogServiceOptions;
  directionsSources?: DirectionsSourceOptions;
  drawingTool?: unknown; // TODO add the type
  edition?: unknown; // TODO add the type
  emailAddress?: string;
  geolocate?: unknown; // TODO add the type
  homeExtentButton?: unknown; // TODO add the type
  importExport?: ImportExportServiceOptions;
  importWithStyle?: boolean;
  optionsApi?: OptionsApiOptions;
  projections?: Projection[];
  queryOverlayStyle?: {
    base?: CommonVectorStyleOptions;
    selection?: CommonVectorStyleOptions;
    focus?: CommonVectorStyleOptions;
  };
  searchOverlayStyle?: {
    base?: CommonVectorStyleOptions;
    selection?: CommonVectorStyleOptions;
    focus?: CommonVectorStyleOptions;
  };
  searchSources?: {
    [key: string]:
      | SearchSourceOptions
      | StoredQueriesSearchSourceOptions
      | StoredQueriesReverseSearchSourceOptions;
  };
  spatialFilter?: SpatialFilterOptions;
}

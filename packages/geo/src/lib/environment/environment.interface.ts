import { DepotOptions } from '@igo2/common';
import { OptionsApiOptions } from '../datasource';
import { DirectionsSourceOptions } from '../directions';
import { DrawOptions } from '../draw/shared/draw.interface';
import { SpatialFilterOptions } from '../filter';
import { ImportExportServiceOptions } from '../import-export';
import {
  GeolocationOptions,
  HomeExtentButtonOptions,
  Projection
} from '../map';
import {
  SearchSourceOptions,
  StoredQueriesReverseSearchSourceOptions,
  StoredQueriesSearchSourceOptions
} from '../search';
import { OverlayStyleOptions } from '../style';
import { CatalogServiceOptions } from '../catalog';

export interface EnvironmentOptions {
  catalog?: CatalogServiceOptions;
  context?: any; // set to any to avoid circular dependency with @igo2/context
  depot?: DepotOptions;
  directionsSources?: DirectionsSourceOptions;
  drawingTool?: DrawOptions;
  edition?: unknown;
  emailAddress?: string;
  geolocate?: GeolocationOptions;
  homeExtentButton?: HomeExtentButtonOptions;
  importExport?: ImportExportServiceOptions;
  importWithStyle?: boolean;
  menu?: {
    // todo move to common?
    button: {
      useThemeColor: boolean;
    };
  };
  optionsApi?: OptionsApiOptions;
  projections?: Projection[];
  queryOverlayStyle?: OverlayStyleOptions;
  searchOverlayStyle?: OverlayStyleOptions;
  searchSources?: {
    showResultsCount?: boolean;
    [key: string]:
      | SearchSourceOptions
      | StoredQueriesSearchSourceOptions
      | StoredQueriesReverseSearchSourceOptions
      | boolean;
  };
  searchBar?: { showSearchButton?: boolean }; // todo move to common?
  spatialFilter?: SpatialFilterOptions;
}

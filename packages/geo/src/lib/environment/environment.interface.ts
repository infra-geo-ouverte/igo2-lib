import { DOMOptions, DepotOptions } from '@igo2/common';

import { CatalogServiceOptions } from '../catalog';
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

export interface EnvironmentOptions {
  catalog?: CatalogServiceOptions;
  // duplicated from packages\context\src\lib\context-manager\shared\context.interface.ts to avoid circular dependency with @igo2/context
  context?: {
    url?: string;
    basePath?: string;
    contextListFile?: string;
    defaultContextUri?: string;
  };
  depot?: DepotOptions;
  directionsSources?: DirectionsSourceOptions;
  dom?: DOMOptions[];
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
      visible?: boolean;
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
  searchBar?: {
    showSearchButton?: boolean;
    showSearchBar?: boolean;
  }; // todo move to common?
  spatialFilter?: SpatialFilterOptions;
}

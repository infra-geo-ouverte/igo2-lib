import { DOMOptions } from '@igo2/common/dom';
import { DepotOptions } from '@igo2/common/environment';

import { CatalogServiceOptions } from '../catalog/shared/catalog.interface';
import { OptionsApiOptions } from '../datasource/shared/options/options-api.interface';
import { DirectionsSourceOptions } from '../directions/directions-sources/directions-source.interface';
import { DrawOptions } from '../draw/shared/draw.interface';
import { SpatialFilterOptions } from '../filter/shared/spatial-filter.interface';
import { ImportExportServiceOptions } from '../import-export/shared/import.interface';
import { HomeExtentButtonOptions } from '../map/home-extent-button/home-extent-button.interface';
import { GeolocationOptions } from '../map/shared/controllers/geolocation.interface';
import { Projection } from '../map/shared/projection.interfaces';
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

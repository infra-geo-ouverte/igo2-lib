import { CatalogServiceOptions } from '../catalog';
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
  depot?: { url: string; trainingGuides?: string[] };
  importExport?: ImportExportServiceOptions;
  importWithStyle?: boolean;
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
}

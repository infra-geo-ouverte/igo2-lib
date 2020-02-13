import { EntityState } from '@igo2/common';

import { MetadataLayerOptions } from './../../metadata/shared/metadata.interface';
import { TooltipType } from '../../layer';
import { TimeFilterOptions } from '../../filter';
import { QueryFormat, QueryHtmlTarget } from '../../query';

import { CatalogItemType, TypeCatalogStrings } from './catalog.enum';

export interface ICatalog {
  id: string;
  title: string;
  url: string;
  items?: CatalogItem[];
  type?: TypeCatalogStrings;
  version?: string;
  matrixSet?: string;
  requestEncoding?: string;
  regFilters?: string[];
  groupImpose?: CatalogItemGroup; // only use by ICompositeCatalog object (id and title)
  timeFilter?: TimeFilterOptions;
  queryFormat?: QueryFormat;
  queryHtmlTarget?: QueryHtmlTarget;
  queryParams?: { [key: string]: string };
  sourceOptions?: { [key: string]: any };
  count?: number;
  tooltipType?: TooltipType.ABSTRACT | TooltipType.TITLE;
  sortDirection?: 'asc' | 'desc';
  setCrossOriginAnonymous?: boolean;
  showLegend?: boolean;
}

export interface ICompositeCatalog extends ICatalog {
  composite: ICatalog[];
}

export interface CatalogItem {
  id: string;
  title: string;
  type: CatalogItemType;
  address?: string;
}

export interface CatalogItemLayer<L = MetadataLayerOptions>
  extends CatalogItem {
  options: L;
}

export interface CatalogItemGroup extends CatalogItem {
  items?: CatalogItem[];
}

export interface CatalogItemState extends EntityState {
  added?: boolean;
}

export interface CatalogServiceOptions {
  baseLayers?: boolean;
  sources?: (ICatalog|ICompositeCatalog)[];
  sourcesUrl?: string;
}

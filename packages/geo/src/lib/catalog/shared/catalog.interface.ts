import { EntityState } from '@igo2/common';

import { LayerOptions, TooltipType } from '../../layer';
import { TimeFilterOptions } from '../../filter';
import { QueryFormat, QueryHtmlTarget  } from '../../query';

import { CatalogItemType } from './catalog.enum';

export interface Catalog {
  id: string;
  title: string;
  url: string;
  items?: CatalogItem[];
  type?: string;
  version?: string;
  matrixSet?: string;
  requestEncoding?: string;
  regFilters?: string[];
  timeFilter?: TimeFilterOptions;
  queryFormat?: QueryFormat;
  queryHtmlTarget?: QueryHtmlTarget;
  queryParams?: { [key: string]: string };
  sourceOptions?: { [key: string]: any };
  count?: number;
  tooltipType?: TooltipType.ABSTRACT | TooltipType.TITLE;
  sortDirection?: 'asc' | 'desc';
  setCrossOriginAnonymous?: boolean;
}

export interface CatalogItem {
  id: string;
  title: string;
  type: CatalogItemType;
}

export interface CatalogItemLayer<L = LayerOptions> extends CatalogItem {
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
  sources?: Catalog[];
  sourcesUrl?: string;
}

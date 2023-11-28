import { Observable } from 'rxjs';

import { TimeFilterOptions } from '../../filter/shared/time-filter.interface';
import { TooltipType } from '../../layer/shared/layers/layer.interface';
import { QueryFormat, QueryHtmlTarget } from '../../query/shared/query.enums';
import { TypeCatalogStrings } from './catalog.enum';
import { CatalogItem, CatalogItemGroup, ICatalog } from './catalog.interface';

export abstract class Catalog implements ICatalog {
  id: string;
  title: string;
  url: string;
  removable?: boolean;
  externalProvider?: boolean;
  abstract?: string;
  forcedProperties?: any[];
  items?: CatalogItem[];
  type?: TypeCatalogStrings;
  version?: string;
  matrixSet?: string;
  requestEncoding?: string;
  regFilters?: string[];
  groupImpose?: CatalogItemGroup;
  groupSeparator?: string;
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
  profils?: string[];

  constructor(options: Catalog) {
    Object.assign(this, options);
  }

  public abstract collectCatalogItems(): Observable<CatalogItem[]>;
}

export type CollectCatalogItemsFn = (
  _this: Catalog
) => Observable<CatalogItem[]>;

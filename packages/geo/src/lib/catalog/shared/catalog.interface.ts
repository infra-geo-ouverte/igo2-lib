import { EntityState } from '@igo2/common';

import { MetadataLayerOptions } from './../../metadata/shared/metadata.interface';
import { TooltipType } from '../../layer';
import { QueryFormat } from '../../query';

import { CatalogItemType, TypeCatalogStrings } from './catalog.enum';

export interface AddedChangeEmitter {
  added: boolean;
  layer: CatalogItemLayer;
  event: Event;
}
export interface AddedChangeGroupEmitter {
  added: boolean;
  group: CatalogItemGroup;
  event: Event;
}

export interface ICatalog {
  id: string;
  title?: string;
  url: string;
  removable?: boolean;
  externalProvider?: boolean;
  items?: CatalogItem[];
  type?: TypeCatalogStrings;
  version?: string;
  matrixSet?: string;
  forcedProperties?: ForcedProperty[];
  requestEncoding?: string;
  regFilters?: string[];
  groupImpose?: CatalogItemGroup; // only use by ICompositeCatalog object (id, title, sortDirection?)
  groupSeparator?: string;
  queryFormat?: QueryFormat;
  queryParams?: { [key: string]: string };
  sourceOptions?: { [key: string]: any };
  tooltipType?: TooltipType.ABSTRACT | TooltipType.TITLE;
  sortDirection?: 'asc' | 'desc';
  setCrossOriginAnonymous?: boolean;
  showLegend?: boolean;
}

export interface ForcedProperty {
  layerName: any;
  title?: string;
  metadataUrl?: string;
  metadataAbstract?: string;
  metadataAbstractAll?: string;
  metadataUrlAll?: string;
}

export interface ICompositeCatalog extends Omit<ICatalog, 'url'> {
  composite: ICatalog[];
}

export interface CatalogItem {
  id: string;
  title: string;
  type?: CatalogItemType;
  address?: string;
  externalProvider?: boolean;
}

export interface CatalogItemLayer<L = MetadataLayerOptions>
  extends CatalogItem {
  options: L;
}

export interface CatalogItemGroup extends CatalogItem {
  items?: CatalogItem[];
  sortDirection?: 'asc' | 'desc'; // use with groupImpose and ICompositeCatalog
}

export interface CatalogItemState extends EntityState {
  added?: boolean;
}

export interface CatalogServiceOptions {
  /** @deprecated Use baselayers instead*/
  baseLayers?: boolean;
  baselayers?: boolean;
  /** @deprecated Not used anymore*/
  emailAddress?: string;
  url?: string;
  sources?: (ICatalog | ICompositeCatalog)[];
  /** @deprecated Use url instead */
  sourcesUrl?: string;
}

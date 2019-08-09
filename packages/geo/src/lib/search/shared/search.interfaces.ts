import { Observable } from 'rxjs';

import { MetadataLayerOptions } from './../../metadata/shared/metadata.interface';
import { SearchSource } from './sources/source';

export interface Research {
  request: Observable<SearchResult[]>;
  reverse: boolean;
  source: SearchSource;
}

export interface SearchResult<T = { [key: string]: any }> {
  data: T;
  source: SearchSource;
  meta: {
    dataType: string;
    id: string;
    title: string;
    titleHtml?: string;
    icon: string;
  };
}

export interface SearchResultItem<L = MetadataLayerOptions> extends SearchResult {
  options: L;
}

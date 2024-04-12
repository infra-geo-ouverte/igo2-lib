import { IconSvg } from '@igo2/common/icon';

import { Observable } from 'rxjs';

import { CommonVectorStyleOptions } from '../../style/shared/vector/vector-style.interface';
import { SearchSource } from './sources/source';
import {
  ReverseSearchOptions,
  TextSearchOptions
} from './sources/source.interfaces';

export interface Research {
  request: Observable<SearchResult[]>;
  reverse: boolean;
  source: SearchSource;
}

export interface SearchResult<T = { [key: string]: any }> {
  data: T;
  source: SearchSource;
  meta: SearchMeta;
  style?: {
    base?: CommonVectorStyleOptions;
    selection?: CommonVectorStyleOptions;
    focus?: CommonVectorStyleOptions;
  };
}

export interface SearchMeta {
  id: string;
  dataType: string;
  title: string;
  titleHtml?: string;
  icon: string | IconSvg;
  score?: number;
  nextPage?: boolean;
  pointerSummaryTitle?: string;
}

/**
 * Search sources that allow searching by text implement this class
 */
export interface TextSearch {
  /**
   * Search by text
   * @param term Text
   * @param options Optional: TextSearchOptions
   * @returns Observable or search results
   */
  search(
    term: string | undefined,
    options?: TextSearchOptions
  ): Observable<SearchResult[]>;
}

/**
 * Search sources that allow searching by coordinates implement this class
 */
export interface ReverseSearch {
  /**
   * Search by text
   * @param lonLat Coordinates
   * @param options Optional: ReverseSearchOptions
   * @returns Observable or search results
   */
  reverseSearch(
    lonLat: [number, number],
    options?: ReverseSearchOptions,
    reverseSearchCoordsFormat?: boolean
  ): Observable<SearchResult[]>;
}

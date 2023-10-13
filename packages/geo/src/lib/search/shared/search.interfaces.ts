import { Observable } from 'rxjs';

import { CommonVectorStyleOptions } from '../../style/shared/vector/vector-style.interface';
import { ReverseSearchOptions, TextSearchOptions } from './sources';
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
    pointerSummaryTitle?: string;
    icon: string;
    score?: number;
    nextPage?: boolean;
  };
  style?: {
    base?: CommonVectorStyleOptions;
    selection?: CommonVectorStyleOptions;
    focus?: CommonVectorStyleOptions;
  };
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

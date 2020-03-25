import { FEATURE } from '../../feature/shared/feature.enums';
import { Feature } from '../../feature/shared/feature.interfaces';
import { SearchSource } from './sources/source';
import { SearchResult } from './search.interfaces';

/**
 * Function that checks whether a search source implements TextSearch
 * @param source Search source
 * @returns True if the search source implements TextSearch
 */
export function sourceCanSearch(source: SearchSource): boolean {
  return (source as any).search !== undefined;
}

/**
 * Function that checks whether a search source implements ReverseSearch
 * @param source Search source
 * @returns True if the search source implements ReverseSearch
 */
export function sourceCanReverseSearch(source: SearchSource): boolean {
  return (source as any).reverseSearch !== undefined;
}

/**
 * Function that checks whether a search source implements ReverseSearch AND is shown in the pointer summary
 * @param source Search source
 * @returns True if the search source implements ReverseSearch AND is shown in the pointer summary
 */
export function sourceCanReverseSearchAsSummary(source: SearchSource): boolean {
  return (source as any).reverseSearch !== undefined && source.showInPointerSummary === true;
}

/**
 * Return a search result out of an Feature. This is used to adapt
 * the IGO query module to the new Feature/SearchResult interfaces
 * @param feature feature
 * @param source Search source
 * @returns SearchResult
 */
export function featureToSearchResult(
  feature: Feature,
  source: SearchSource
): SearchResult<Feature> {
  feature.sourceId = source.getId();
  return {
    source,
    data: feature,
    meta: {
      dataType: FEATURE,
      id: feature.meta.id as string,
      title: feature.meta.title,
      icon: feature.meta.icon || 'map-marker'
    }
  };
}

import { Injectable } from '@angular/core';

import { EntityStore } from '@igo2/common';
import { SearchResult } from '@igo2/geo';

/**
 * Service that holds the state of the query module
 */
@Injectable({
  providedIn: 'root'
})
export class QueryState {
  /**
   * Store that holds the query results
   */
  public store: EntityStore<SearchResult> = new EntityStore<SearchResult>([]);

  constructor() {}
}

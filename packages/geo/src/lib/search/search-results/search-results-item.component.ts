import { Component, Input, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';

import {
  getEntityTitle,
  getEntityTitleHtml,
  getEntityIcon,
  EntityStore
} from '@igo2/common';

import { SearchResult, SearchResultItem } from '../shared/search.interfaces';

/**
 * Search results list item
 */
@Component({
  selector: 'igo-search-results-item',
  templateUrl: './search-results-item.component.html',
  styleUrls: ['./search-results-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultsItemComponent {

  /**
   * Search result item
   */
  @Input() layer: SearchResultItem;

  /**
   * Search results store
   */
  @Input() store: EntityStore<SearchResult>;

  /**
   * Search result title
   * @internal
   */
  get title(): string {
    return getEntityTitle(this.layer);
  }

  /**
   * Search result HTML title
   * @internal
   */
  get titleHtml(): string {
    return getEntityTitleHtml(this.layer);
  }

  /**
   * Search result icon
   * @internal
   */
  get icon(): string {
    return getEntityIcon(this.layer);
  }

  constructor() {}

}

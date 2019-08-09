import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import {
  getEntityTitle,
  getEntityTitleHtml,
  getEntityIcon
} from '@igo2/common';

import { SearchResult } from '../shared/search.interfaces';

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
   * Search result
   */
  @Input() result: SearchResult;

  /**
   * Search result title
   * @internal
   */
  get title(): string {
    return getEntityTitle(this.result);
  }

  /**
   * Search result HTML title
   * @internal
   */
  get titleHtml(): string {
    return getEntityTitleHtml(this.result);
  }

  /**
   * Search result icon
   * @internal
   */
  get icon(): string {
    return getEntityIcon(this.result);
  }

  constructor() {}
}

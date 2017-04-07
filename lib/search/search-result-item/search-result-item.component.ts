import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { SearchResult } from '../shared';

@Component({
  selector: 'igo-search-result-item',
  templateUrl: './search-result-item.component.html',
  styleUrls: ['./search-result-item.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultItemComponent {

  @Input()
  get result(): SearchResult { return this._result; }
  set result(value: SearchResult) {
    this._result = value;
  }
  private _result: SearchResult;

  constructor() { }

}

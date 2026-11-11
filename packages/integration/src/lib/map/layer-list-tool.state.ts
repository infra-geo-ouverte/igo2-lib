import { Injectable } from '@angular/core';

import { LayerListControlsOptions } from '@igo2/geo';

import { BehaviorSubject } from 'rxjs';

/**
 * Service that holds the state of layer list tool values
 */
@Injectable({
  providedIn: 'root'
})
export class LayerListToolState {
  readonly keyword$ = new BehaviorSubject<string>('');
  readonly sortAlpha$ = new BehaviorSubject<boolean | undefined>(undefined);
  readonly onlyVisible$ = new BehaviorSubject<boolean | undefined>(undefined);
  readonly selectedTab$ = new BehaviorSubject<number | undefined>(undefined);

  setKeyword(keyword: string) {
    this.keyword$.next(keyword);
  }

  setSortAlpha(sort: boolean | undefined) {
    this.sortAlpha$.next(sort);
  }

  setOnlyVisible(onlyVisible: boolean | undefined) {
    this.onlyVisible$.next(onlyVisible);
  }

  setSelectedTab(tab: number) {
    this.selectedTab$.next(tab);
  }

  getLayerListControls(): LayerListControlsOptions {
    return {
      keyword: this.keyword$.value,
      onlyVisible: this.onlyVisible$.value,
      sortAlpha: this.sortAlpha$.value
    };
  }
}

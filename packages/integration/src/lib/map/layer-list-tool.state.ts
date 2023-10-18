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
  readonly keyword$: BehaviorSubject<string> = new BehaviorSubject('');
  readonly sortAlpha$: BehaviorSubject<boolean> = new BehaviorSubject(
    undefined
  );
  readonly onlyVisible$: BehaviorSubject<boolean> = new BehaviorSubject(
    undefined
  );
  readonly selectedTab$: BehaviorSubject<number> = new BehaviorSubject(
    undefined
  );

  setKeyword(keyword: string) {
    this.keyword$.next(keyword);
  }

  setSortAlpha(sort: boolean) {
    this.sortAlpha$.next(sort);
  }

  setOnlyVisible(onlyVisible: boolean) {
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

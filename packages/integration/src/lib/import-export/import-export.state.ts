import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

/**
 * Service that holds the state of the measure module
 */
@Injectable({
  providedIn: 'root'
})
export class ImportExportState {

  readonly selectedTab$: BehaviorSubject<number> = new BehaviorSubject(undefined);

  setSelectedTab(tab: number) {
    this.selectedTab$.next(tab);
  }
}

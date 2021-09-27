import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { EntityStore, EntityStoreWatcher } from '@igo2/common';
import { uuid } from '@igo2/utils';

import { Stop } from './shared/directions.interface';
import { Subscription } from 'rxjs';
import { computeStopOrderBasedOnListOrder, updateStoreSorting } from './shared/directions.utils';

@Component({
  selector: 'igo-directions',
  templateUrl: './directions.component.html',
  styleUrls: ['./directions.component.scss']
})
export class DirectionsComponent implements OnInit, OnDestroy {

  get allStops() {
    return this.stopsStore.view.all();
  }

  private watcher: EntityStoreWatcher<Stop>;

  private storeEmpty$$: Subscription;
  private storeChange$$: Subscription;

  @Input() stopsStore: EntityStore<Stop>;
  @Input() debounce: number = 200;
  @Input() length: number = 2;

  constructor(private cdRef: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.initStores();
  }

  ngOnDestroy(): void {
    this.storeEmpty$$.unsubscribe();
    this.storeChange$$.unsubscribe();
  }

  private initStores() {
    // Watch if the store is empty to reset it
    this.storeEmpty$$ = this.stopsStore.empty$
      .pipe(distinctUntilChanged())
      .subscribe((empty) => {
        if (empty) {
          this.stopsStore.insert({ id: uuid(), order: 0, placeholder: 'start' });
          this.stopsStore.insert({ id: uuid(), order: 1, placeholder: 'end' });
        }
      });
    this.watcher = new EntityStoreWatcher(this.stopsStore, this.cdRef);

    this.storeChange$$ = this.stopsStore.entities$
      .pipe(debounceTime(this.debounce))
      .subscribe(() => {
        this.updateSortOrder();
        /*this.getRoutes();*/
      });
  }

  private updateSortOrder() {
    setTimeout(() => {
      computeStopOrderBasedOnListOrder(this.stopsStore, this.allStops, false);
    }, 50);
    updateStoreSorting(this.stopsStore);
  }

}

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { LanguageService } from '@igo2/core';
import { EntityStore } from '@igo2/common';
import { uuid } from '@igo2/utils';

import { Stop } from '../shared/directions.interface';
import { distinctUntilChanged, skipWhile } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'igo-directions-form2',
  templateUrl: './directions-form2.component.html',
  styleUrls: ['./directions-form2.component.scss']
})
export class DirectionsFormComponent2 implements OnInit, OnDestroy {


  get allStops() {
    return this.stopsStore.view.all();
  }

  storeSortChange$: BehaviorSubject<boolean> = new BehaviorSubject(undefined);
  private storeEmpty$$: Subscription;
  private storeChange$$: Subscription;
  public moreThanTwoStops: boolean = false;

  constructor(
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.initStores();
  }

  ngOnDestroy(): void {
    this.storeEmpty$$.unsubscribe();
    this.storeChange$$.unsubscribe();
  }

  /**
   * The route and vertex store
   */
  @Input() stopsStore: EntityStore<Stop>;

  private initStores() {
    // Watch if the store is empty to reset it
    this.storeEmpty$$ = this.stopsStore.empty$
      .pipe(distinctUntilChanged())
      .subscribe((empty) => {
        if (empty) {
          // todo put back uuid()
          this.stopsStore.insert({ id: '0', order: 0 });
          this.stopsStore.insert({ id: '1', order: 1 });
        }
      });
    this.storeChange$$ =
      combineLatest([
        this.storeSortChange$,
        this.stopsStore.count$.pipe(distinctUntilChanged())
      ])
        .subscribe(() => {
          this.checkStoreCount();
          this.updateSortOrder();
          this.getRoutes();
        });
  }

  private getRoutes() {
    const stopsWithCoords = this.stopsStore.all().filter((s) => s.stopCoordinates)
    if (stopsWithCoords.length >= 2) {
      console.log('stopsWithCoords', stopsWithCoords)
    } else {
      console.log('clear route!!!')
    }
  }

  private updateSortOrder() {
    setTimeout(() => {
      this.computeStopOrderBasedOnListOrder(this.allStops, false)
    }, 50);
    this.updateStoreSorting();
  }

  resetStops() {
    this.stopsStore.clear();
  }

  // stop are always added before the last stop.
  addStop(): void {
    const lastStop = this.allStops[this.stopsStore.count - 1];
    const lastStopId = lastStop.id;
    const lastStopOrder = lastStop.order;
    this.stopsStore.get(lastStopId).order = lastStopOrder + 1;
    // todo put back uuid()
    this.stopsStore.insert(
      { id: this.stopsStore.count.toLocaleString(),
        order: lastStopOrder,
        stopCoordinates: [this.stopsStore.count,this.stopsStore.count] 
      });
  }

  removeStop(stop) {
    this.stopsStore.delete(stop);
  }

  private checkStoreCount(){
    if (this.stopsStore.count > 2) {
      this.moreThanTwoStops = true;
    } else {
      this.moreThanTwoStops = false;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    this.moveStops(event.previousIndex, event.currentIndex)
  }

  private updateStoreSorting(direction: 'asc'|'desc' = 'asc', field='order') {
    this.stopsStore.view.sort({
      direction,
      valueAccessor: (stop: Stop) => stop[field]
    });
  }

  private moveStops(fromIndex, toIndex) {
    if (fromIndex !== toIndex) {
      const stopsList = [...this.allStops]
      moveItemInArray(stopsList, fromIndex, toIndex);
      this.computeStopOrderBasedOnListOrder(stopsList, true);
      this.updateStoreSorting();
    }

  }

  private computeStopOrderBasedOnListOrder(stops: Stop[], emit: boolean) {
    let cnt = 0;
    const localStops = [...stops];
    localStops.map(s => {
      const stop = this.stopsStore.get(s.id);
      if (stop) {
        this.stopsStore.get(s.id).order = cnt;
        cnt += 1;
      }
    })
    if (emit) {
      this.storeSortChange$.next(true);
    }
  }
}
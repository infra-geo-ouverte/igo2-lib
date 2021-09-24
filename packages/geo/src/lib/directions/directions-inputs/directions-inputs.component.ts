import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { debounceTime, distinctUntilChanged, map, skipWhile } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Subscription, zip } from 'rxjs';

import { LanguageService } from '@igo2/core';
import { EntityStore } from '@igo2/common';
import { uuid } from '@igo2/utils';

import { Stop } from '../shared/directions.interface';

import { SearchService } from '../../search/shared/search.service';
import { SearchResult } from '../../search/shared/search.interfaces';
import { Feature } from '../../feature/shared/feature.interfaces';
import pointOnFeature from '@turf/point-on-feature';

@Component({
  selector: 'igo-directions-inputs',
  templateUrl: './directions-inputs.component.html',
  styleUrls: ['./directions-inputs.component.scss']
})
export class DirectionsInputsComponent implements OnInit, OnDestroy {


  get allStops() {
    return this.stopsStore.view.all();
  }
  private readonly invalidKeys = ['Control', 'Shift', 'Alt'];

  private stopChange$: BehaviorSubject<{ stop: Stop, property: string }> = new BehaviorSubject(undefined);
  private storeSortChange$: BehaviorSubject<boolean> = new BehaviorSubject(undefined);

  private search$$: Subscription;
  private stopChange$$: Subscription;
  private storeEmpty$$: Subscription;
  private storeChange$$: Subscription;
  public moreThanTwoStops: boolean = false;

  @Input() stopsStore: EntityStore<Stop>;
  @Input() debounce: number = 200;
  @Input() length: number = 2;

  constructor(
    private languageService: LanguageService,
    private searchService: SearchService,
    private changeDetectorRefs: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initStores();
  }

  ngOnDestroy(): void {
    this.storeEmpty$$.unsubscribe();
    this.storeChange$$.unsubscribe();
    this.stopChange$$.unsubscribe();
  }

  private initStores() {
    // Watch if the store is empty to reset it
    this.storeEmpty$$ = this.stopsStore.empty$
      .pipe(distinctUntilChanged())
      .subscribe((empty) => {
        if (empty) {
          this.stopsStore.insert({ id: uuid(), order: 0 });
          this.stopsStore.insert({ id: uuid(), order: 1, isLastStop: true });
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

    this.stopChange$$ = this.stopChange$
      .pipe(
        skipWhile(change => !change),
        debounceTime(this.debounce),
        distinctUntilChanged()
      )
      .subscribe((change: { stop: Stop, property: string }) => {
        switch (change.property) {
          case 'text':
            console.log('changement de type texte', change);
            this.handleTermChanged(change.stop[change.property], change.stop);
            break;
          case 'coordinates':
            console.log('changement de type coordinates', change);
            break;
          default:
            break;
        }
      });
  }


  private handleTermChanged(term: string, stop: Stop) {
    if (term !== undefined || term.length !== 0) {
      if (this.search$$) {
        this.search$$.unsubscribe();
      }
      const researches = this.searchService.search(term, { searchType: 'Feature' });
      const requests$ = researches.map(
        res => res.request
          .pipe(
            map((results: SearchResult[]) => results.filter(r => r.data.geometry)))
      );
      this.search$$ = zip(...requests$)
        .pipe(
          map((searchRequests: SearchResult[][]) => [].concat.apply([], searchRequests)),
          map((searchResults: SearchResult[]) => {
            const searchProposals = [];
            [...new Set(searchResults.map(item => item.source))].map(source => {
              searchProposals.push({
                source,
                meta: searchResults.find(sr => sr.source === source).meta,
                results: searchResults.filter(sr => sr.source === source).map(r => r.data)
              });
            });
            stop.searchProposals = searchProposals;
          })
        ).subscribe(() => this.changeDetectorRefs.detectChanges());
    }

  }

  chooseProposal(result: Feature, stop: Stop) {
    if (result) {
      let geomCoord;
      const geom = result.geometry;
      if (geom.type === 'Point') {
        geomCoord = geom.coordinates;
      } else {
        const point = pointOnFeature(result.geometry);
        geomCoord = [
          point.geometry.coordinates[0],
          point.geometry.coordinates[1]
        ];
      }
      if (geomCoord) {
        stop.coordinates = geomCoord;
        stop.text = result.meta.title;
        this.stopChange$.next({ stop, property: 'coordinates' });
      }
    }
  }

  setStopText(event: KeyboardEvent, stop: Stop) {
    const term = (event.target as HTMLInputElement).value;
    if (this.validateTerm(term)) {
      stop.text = term;
      this.stopChange$.next({ stop, property: 'text' });
    }
  }

  validateTerm(term: string) {
    if (
      this.keyIsValid(term) &&
      (term.length >= this.length || term.length === 0)
    ) {
      return true;
    }
    return false;
  }

  private keyIsValid(key: string) {
    return this.invalidKeys.find(value => value === key) === undefined;
  }

  private getRoutes() {
    const stopsWithCoords = this.stopsStore.all().filter((s) => s.coordinates);
    if (stopsWithCoords.length >= 2) {
      console.log('stopsWithCoords', stopsWithCoords);
    } else {
      console.log('clear route!!!');
    }
  }

  private updateSortOrder() {
    setTimeout(() => {
      this.computeStopOrderBasedOnListOrder(this.allStops, false);
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
    this.stopsStore.insert(
      {
        id: uuid(),
        order: lastStopOrder
      });
  }

  removeStop(stop) {
    this.stopsStore.delete(stop);
  }

  clearStop(stop: Stop) {
    this.stopsStore.update({ id: stop.id, order: stop.order });
  }

  private checkStoreCount() {
    if (this.stopsStore.count > 2) {
      this.moreThanTwoStops = true;
    } else {
      this.moreThanTwoStops = false;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    this.moveStops(event.previousIndex, event.currentIndex);
  }

  private updateStoreSorting(direction: 'asc' | 'desc' = 'asc', field = 'order') {
    this.stopsStore.view.sort({
      direction,
      valueAccessor: (stop: Stop) => stop[field]
    });
  }

  private moveStops(fromIndex, toIndex) {
    if (fromIndex !== toIndex) {
      const stopsList = [...this.allStops];
      moveItemInArray(stopsList, fromIndex, toIndex);
      this.computeStopOrderBasedOnListOrder(stopsList, true);
      this.updateStoreSorting();
    }

  }

  private computeStopOrderBasedOnListOrder(stops: Stop[], emit: boolean) {
    let cnt = 0;
    const stopsCnt = stops.length;
    const localStops = [...stops];
    localStops.map(s => {
      const stop = this.stopsStore.get(s.id);
      if (stop) {
        stop.order = cnt;
        stop.isLastStop = cnt === stopsCnt - 1 ? true : false;
        cnt += 1;
      }
    });
    if (emit) {
      this.storeSortChange$.next(true);
    }
  }
}

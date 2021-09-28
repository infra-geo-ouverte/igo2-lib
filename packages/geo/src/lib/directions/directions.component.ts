import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import { EntityStore, EntityStoreWatcher } from '@igo2/common';
import { uuid } from '@igo2/utils';

import { DirectionOptions, FeatureWithDirection, FeatureWithStop, FeatureWithStopProperties, Stop } from './shared/directions.interface';
import { Subscription } from 'rxjs';
import { addDirectionToRoutesFeatureStore, addStopToStopsFeatureStore, computeStopOrderBasedOnListOrder, initRoutesFeatureStore, initStopsFeatureStore, updateStoreSorting } from './shared/directions.utils';
import { FeatureStore } from '../feature/shared/store';
import { Feature } from '../feature/shared/feature.interfaces';
import { DirectionsService } from './shared/directions.service';



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

  private projection = 'EPSG:4326';

  private storeEmpty$$: Subscription;
  private storeChange$$: Subscription;
  private routesQueries$$: Subscription[] = [];

  @Input() stopsStore: EntityStore<Stop>;
  @Input() stopsFeatureStore: FeatureStore<FeatureWithStop>;
  @Input() routesFeatureStore: FeatureStore<FeatureWithDirection>;
  @Input() debounce: number = 200;
  @Input() length: number = 2;

  constructor(
    private cdRef: ChangeDetectorRef,
    private languageService: LanguageService,
    private directionsService: DirectionsService
  ) { }


  ngOnInit(): void {
    this.initEntityStores();
    setTimeout(() => {
      initStopsFeatureStore(this.stopsFeatureStore, this.languageService);
      initRoutesFeatureStore(this.routesFeatureStore, this.languageService);
      // this.initOlInteraction();
    }, 1);

  }

  ngOnDestroy(): void {
    this.storeEmpty$$.unsubscribe();
    this.storeChange$$.unsubscribe();
    this.routesQueries$$.map((u) => u.unsubscribe());
  }

  private initEntityStores() {
    this.watcher = new EntityStoreWatcher(this.stopsStore, this.cdRef);
    this.monitorEmptyEntityStore();
    this.monitorEntityStoreChange();
  }


  private monitorEmptyEntityStore() {
    // Watch if the store is empty to reset it
    this.storeEmpty$$ = this.stopsStore.empty$
      .pipe(distinctUntilChanged())
      .subscribe((empty) => {
        if (empty) {
          this.stopsStore.insert({ id: uuid(), order: 0, relativePosition: 'start' });
          this.stopsStore.insert({ id: uuid(), order: 1, relativePosition: 'end' });
        }
      });
  }

  private monitorEntityStoreChange() {
    this.storeChange$$ = this.stopsStore.entities$
      .pipe(debounceTime(this.debounce))
      .subscribe((stops: Stop[]) => {
        this.updateSortOrder();
        this.handleStopsFeature(stops);
        this.getRoutes();
      });
  }

  private handleStopsFeature(stops: Stop[]) {
    const stopsWithCoordinates = stops.filter(stop => stop.coordinates);
    stopsWithCoordinates.map(stop => this.addStopOverlay(stop));
    this.stopsFeatureStore.all().map(
      (stopFeature: Feature<FeatureWithStopProperties>) => {
        if (!this.stopsStore.get(stopFeature.properties.id)) {
          this.stopsFeatureStore.delete(stopFeature);
        }
      });
    const stopsWithoutCoordinates = stops.filter(stop => !stop.coordinates);
    stopsWithoutCoordinates.map(stop => {
      const stopFeature = this.stopsFeatureStore.get(stop.id);
      if (stopFeature) {
        this.stopsFeatureStore.delete(stopFeature);
      }
    });
  }

  private getRoutes(isOverview: boolean = false, round: number = 6) {
    const stopsWithCoordinates = this.stopsStore.view.all().filter(stop => stop.coordinates);
    if (stopsWithCoordinates.length < 2) {
      this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
      return;
    }

    const roundFactor = Math.pow(10, round);
    const roundedCoordinates = stopsWithCoordinates.map((stop: Stop) => {
      const roundedCoord: [number, number] = [
        Math.round((stop.coordinates[0]) * roundFactor) / roundFactor,
        Math.round((stop.coordinates[1]) * roundFactor) / roundFactor];
      return roundedCoord;
    });
    const overviewDirectionsOptions: DirectionOptions = {
      overview: true,
      steps: false,
      alternatives: false,
    };
    const routeResponse = this.directionsService.route(
      roundedCoordinates,
      isOverview ? overviewDirectionsOptions : undefined
    );
    if (routeResponse) {
      routeResponse.map(res =>
        this.routesQueries$$.push(
          res.subscribe(directions => {
            this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
            directions.map(direction =>
              addDirectionToRoutesFeatureStore(
                this.routesFeatureStore,
                direction,
                this.projection,
                direction === directions[0] ? true : false)
            );
          })
        )
      );
    }
  }

  private updateSortOrder() {
    setTimeout(() => {
      computeStopOrderBasedOnListOrder(this.stopsStore, this.allStops, false);
    }, 50);
    updateStoreSorting(this.stopsStore);
  }

  public addStopOverlay(stop: Stop) {
    addStopToStopsFeatureStore(stop, this.stopsFeatureStore, this.projection, this.languageService);
  }
}

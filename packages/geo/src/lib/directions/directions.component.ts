import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import { EntityStore, EntityStoreWatcher } from '@igo2/common';

import { DirectionOptions, FeatureWithDirection, FeatureWithStop, FeatureWithStopProperties, Stop } from './shared/directions.interface';
import { combineLatest, Subscription } from 'rxjs';
import { addDirectionToRoutesFeatureStore, addStopToStopsFeatureStore, addStopToStore, initRoutesFeatureStore, initStopsFeatureStore, updateStoreSorting } from './shared/directions.utils';
import { FeatureStore } from '../feature/shared/store';
import { Feature } from '../feature/shared/feature.interfaces';
import { DirectionsService } from './shared/directions.service';



@Component({
  selector: 'igo-directions',
  templateUrl: './directions.component.html',
  styleUrls: ['./directions.component.scss']
})
export class DirectionsComponent implements OnInit, OnDestroy {

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
    this.storeEmpty$$ = this.stopsStore.count$
      .pipe(
        distinctUntilChanged(),
        debounceTime(this.debounce)
      ).subscribe((count) => {
        if (count < 2) {
          addStopToStore(this.stopsStore);
        }
      });
  }

  private monitorEntityStoreChange() {
    this.storeChange$$ = combineLatest([
      this.stopsStore.state.change$,
      this.stopsStore.entities$])
      .pipe(debounceTime(this.debounce))
      .subscribe(() => {
        updateStoreSorting(this.stopsStore);
        this.handleStopsFeature();
        this.getRoutes();
      });
  }

  private handleStopsFeature() {
    const stops = this.stopsStore.all();
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
    const stopsWithCoordinates = this.stopsStore.stateView
      .all()
      .filter(stopWithState => stopWithState.entity.coordinates);
    if (stopsWithCoordinates.length < 2) {
      this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
      return;
    }

    const roundFactor = Math.pow(10, round);
    const roundedCoordinates = stopsWithCoordinates.map((stopWithState) => {
      const roundedCoord: [number, number] = [
        Math.round((stopWithState.entity.coordinates[0]) * roundFactor) / roundFactor,
        Math.round((stopWithState.entity.coordinates[1]) * roundFactor) / roundFactor];
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

  public addStopOverlay(stop: Stop) {
    addStopToStopsFeatureStore(stop, this.stopsStore, this.stopsFeatureStore, this.projection, this.languageService);
  }
}

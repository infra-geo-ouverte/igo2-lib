import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import { EntityStoreWatcher } from '@igo2/common';

import * as olCondition from 'ol/events/condition';
import * as olInteraction from 'ol/interaction';
import * as olProj from 'ol/proj';
import { TranslateEvent } from 'ol/interaction/Translate';
import Collection from 'ol/Collection';
import { SelectEvent } from 'ol/interaction/Select';

import {
  DirectionOptions,
  FeatureWithStopProperties,
  Stop
} from './shared/directions.interface';
import { Subject, Subscription } from 'rxjs';
import {
  addDirectionToRoutesFeatureStore,
  addStopToStopsFeatureStore,
  addStopToStore,
  initRoutesFeatureStore,
  initStepFeatureStore,
  initStopsFeatureStore,
  updateStoreSorting
} from './shared/directions.utils';
import { Feature } from '../feature/shared/feature.interfaces';
import { DirectionsService } from './shared/directions.service';
import { DirectionType, ProposalType } from './shared/directions.enum';
import { roundCoordTo, stringToLonLat } from '../map';
import { SearchService } from '../search/shared/search.service';
import { ChangeUtils, ObjectUtils } from '@igo2/utils';
import {
  RoutesFeatureStore,
  StepFeatureStore,
  StopsFeatureStore,
  StopsStore
} from './shared/store';
import { FeatureStoreLoadingStrategy } from '../feature/shared/strategies/loading';
import { Research, SearchResult } from '../search/shared/search.interfaces';
import { QueryService } from '../query/shared/query.service';

@Component({
  selector: 'igo-directions',
  templateUrl: './directions.component.html',
  styleUrls: ['./directions.component.scss']
})
export class DirectionsComponent implements OnInit, OnDestroy {
  private watcher: EntityStoreWatcher<Stop>;

  public projection: string = 'EPSG:4326';

  private zoomRoute$$: Subscription;
  private storeEmpty$$: Subscription;
  private storeChange$$: Subscription;
  private routesQueries$$: Subscription[] = [];

  private selectStopInteraction: olInteraction.Select;
  private translateStop: olInteraction.Translate;
  private selectedRoute: olInteraction.Select;
  private focusOnStop: boolean = false;
  private isTranslating: boolean = false;

  public previousStops: Stop[] = [];

  private searchs$$: Subscription[] = [];

  @Input() contextUri: string;
  @Input() stopsStore: StopsStore;
  @Input() stopsFeatureStore: StopsFeatureStore;
  @Input() routesFeatureStore: RoutesFeatureStore;
  @Input() stepFeatureStore: StepFeatureStore;
  @Input() debounce: number = 200;
  @Input() length: number = 2;
  @Input() coordRoundedDecimals: number = 6;
  @Input() zoomToActiveRoute$: Subject<void> = new Subject();

  /**
   * Wheter one of the direction control is active
   * @internal
   */
  get directionControlIsActive(): boolean {
    return !this.queryService.queryEnabled;
  }

  get interactions(): olInteraction.Interaction[] {
    return [this.selectStopInteraction, this.translateStop, this.selectedRoute];
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private languageService: LanguageService,
    private directionsService: DirectionsService,
    private searchService: SearchService,
    private queryService: QueryService
  ) {}

  ngOnInit(): void {
    this.queryService.queryEnabled = false;
    this.initEntityStores();
    setTimeout(() => {
      initStopsFeatureStore(this.stopsFeatureStore, this.languageService);
      initRoutesFeatureStore(this.routesFeatureStore, this.languageService);
      initStepFeatureStore(this.stepFeatureStore);
      this.initOlInteraction();
    }, 1);
  }

  ngOnDestroy(): void {
    this.queryService.queryEnabled = true;
    this.storeEmpty$$.unsubscribe();
    this.storeChange$$.unsubscribe();
    this.routesQueries$$.map((u) => u.unsubscribe());
    this.zoomRoute$$.unsubscribe();
    this.freezeStores();
  }

  private freezeStores() {
    this.interactions.map((interaction) =>
      this.routesFeatureStore.layer.map.ol.removeInteraction(interaction)
    );
    this.stopsFeatureStore.deactivateStrategyOfType(
      FeatureStoreLoadingStrategy
    );
    this.routesFeatureStore.deactivateStrategyOfType(
      FeatureStoreLoadingStrategy
    );
    this.stepFeatureStore.deactivateStrategyOfType(FeatureStoreLoadingStrategy);
  }

  private initEntityStores() {
    this.watcher = new EntityStoreWatcher(this.stopsStore, this.cdRef);
    this.monitorEmptyEntityStore();
    this.monitorEntityStoreChange();
    this.monitorActiveRouteZoom();
  }

  private monitorActiveRouteZoom() {
    this.zoomRoute$$ = this.zoomToActiveRoute$.subscribe(() => {
      if (this.routesFeatureStore.count >= 1) {
        const activeRoute = this.routesFeatureStore
          .all()
          .find((route) => route.properties.active);

        if (activeRoute) {
          activeRoute.ol.getGeometry();
          const routeExtent = activeRoute.ol.getGeometry().getExtent();
          this.routesFeatureStore.layer.map.viewController.zoomToExtent(
            routeExtent as [number, number, number, number]
          );
        }
      }
    });
  }

  private initOlInteraction() {
    this.selectStopInteraction = new olInteraction.Select({
      layers: [this.stopsFeatureStore.layer.ol],
      hitTolerance: 7,
      condition: (event) => {
        return event.type === 'pointermove' && !event.dragging;
      }
    });

    this.translateStop = new olInteraction.Translate({
      features: this.selectStopInteraction.getFeatures()
    });
    this.translateStop.on('translating', (evt: TranslateEvent) => {
      this.isTranslating = true;
      this.executeStopTranslation(evt.features);
    });
    this.translateStop.on('translateend', (evt: TranslateEvent) => {
      this.isTranslating = false;
      this.executeStopTranslation(evt.features);
    });

    this.selectedRoute = new olInteraction.Select({
      layers: [this.routesFeatureStore.layer.ol],
      condition: olCondition.click,
      hitTolerance: 7,
      filter: (feature) => {
        return (
          feature.get('type') === DirectionType.Route &&
          feature.get('active') &&
          !this.isTranslating
        );
      }
    });
    this.selectedRoute.on('select', (evt: SelectEvent) => {
      if (this.focusOnStop === false) {
        const selectCoordinates = roundCoordTo(
          olProj.transform(
            (evt as any).mapBrowserEvent.coordinate,
            this.routesFeatureStore.layer.map.projection,
            this.projection
          ) as [number, number],
          this.coordRoundedDecimals
        );
        const addedStop = addStopToStore(this.stopsStore);
        addedStop.text = selectCoordinates.join(',');
        addedStop.coordinates = [selectCoordinates[0], selectCoordinates[1]];
      }
    });

    this.interactions.map((interaction) =>
      this.routesFeatureStore.layer.map.ol.addInteraction(interaction)
    );
  }

  onStopInputHasFocusChange(stopInputHasFocus: boolean) {
    stopInputHasFocus
      ? this.routesFeatureStore.layer.map.ol.removeInteraction(
          this.selectedRoute
        )
      : this.routesFeatureStore.layer.map.ol.addInteraction(this.selectedRoute);
  }

  private executeStopTranslation(features: Collection<any>) {
    if (features.getLength() === 0) {
      return;
    }
    const firstFeature = features.getArray()[0];
    const translatedStopId = firstFeature.getId();

    const translationCoordinates = olProj.transform(
      firstFeature.getGeometry().getCoordinates(),
      this.stopsFeatureStore.layer.map.projection,
      this.projection
    );
    const translatedStop = this.stopsStore.get(translatedStopId);
    const roundedCoord = roundCoordTo(
      translationCoordinates as [number, number],
      this.coordRoundedDecimals
    );
    translatedStop.coordinates = roundedCoord;
    translatedStop.text = roundedCoord.join(',');
    this.stopsStore.update(translatedStop);
  }

  private monitorEmptyEntityStore() {
    // Watch if the store is empty to reset it
    this.storeEmpty$$ = this.stopsStore.count$
      .pipe(distinctUntilChanged())
      .subscribe((count) => {
        if (count < 2) {
          addStopToStore(this.stopsStore);
          if (this.stopsStore.count === 2) {
            this.stopsStore.storeInitialized$.next(true);
            return;
          }
          this.stopsStore.storeInitialized$.next(false);
        }
        this.routesQueries$$.map((u) => u.unsubscribe());
      });
  }

  private monitorEntityStoreChange() {
    this.storeChange$$ = this.stopsStore.entities$
      .pipe(debounceTime(this.debounce))
      .subscribe((stops: Stop[]) => {
        this.handleStopDiff(stops);
        updateStoreSorting(this.stopsStore);
        this.handleStopsFeature();
        this.getRoutes(this.isTranslating);
      });
  }

  cancelSearch() {
    this.searchs$$.map((s) => s.unsubscribe());
  }

  private handleStopDiff(stops: Stop[]) {
    const simplifiedStops = stops.map((stop: Stop) => {
      return ObjectUtils.removeUndefined({
        ...{ id: stop.id, text: stop.text, coordinates: stop.coordinates }
      });
    });
    const diff = ChangeUtils.findChanges(this.previousStops, simplifiedStops, [
      'coordinates'
    ]);
    const stopIdToProcess = diff.added.concat(diff.modified);
    if (stopIdToProcess) {
      stopIdToProcess.map((change) => {
        const changedStop = change.newValue as Stop;
        if (changedStop) {
          const stop: Stop = this.stopsStore.get(changedStop.id);
          const term = stop.text;
          if (!term || term.length === 0) {
            return;
          }
          const response = stringToLonLat(
            term,
            this.stopsFeatureStore.layer.map.projection
          );
          let researches: Research[];
          let isCoord = false;
          if (response.lonLat) {
            isCoord = true;
          }
          researches = this.searchService.search(term, {
            searchType: 'Feature'
          });
          this.cancelSearch();
          const requests$ = researches.map((res) =>
            res.request.pipe(
              map((results: SearchResult[]) =>
                results.filter((r) =>
                  isCoord
                    ? r.data.geometry.type === 'Point' && r.data.geometry
                    : r.data.geometry
                )
              )
            )
          );
          this.searchs$$ = requests$.map((request) => {
            return request
              .pipe(
                map((results: SearchResult[]) =>
                  results.filter((r) =>
                    isCoord
                      ? r.data.geometry.type === 'Point' && r.data.geometry
                      : r.data.geometry
                  )
                )
              )
              .subscribe((res: SearchResult[]) => {
                if (res.length > 0) {
                  const source = res[0].source;
                  const meta = res[0].meta;
                  const results = res.map((r) => r.data);
                  if (!stop.searchProposals) {
                    stop.searchProposals = [];
                  }
                  stop.searchProposals = stop.searchProposals.filter(
                    (sp) =>
                      sp.type ===
                      (isCoord ? ProposalType.Coord : ProposalType.Text)
                  );
                  let storedSource = stop.searchProposals.find(
                    (sp) => sp.source === source
                  );
                  if (storedSource) {
                    storedSource.results = results;
                  } else {
                    stop.searchProposals.push({
                      type: isCoord ? ProposalType.Coord : ProposalType.Text,
                      source,
                      meta,
                      results
                    });
                  }
                }
                this.cdRef.detectChanges();
              });
          });
        }
      });
    }
    this.previousStops = simplifiedStops;
  }

  private handleStopsFeature() {
    const stops = this.stopsStore.all();
    const stopsWithCoordinates = stops.filter((stop) => stop.coordinates);
    stopsWithCoordinates.map((stop) => this.addStopOverlay(stop));
    this.stopsFeatureStore
      .all()
      .map((stopFeature: Feature<FeatureWithStopProperties>) => {
        if (!this.stopsStore.get(stopFeature.properties.id)) {
          this.stopsFeatureStore.delete(stopFeature);
        }
      });
    const stopsWithoutCoordinates = stops.filter((stop) => !stop.coordinates);
    stopsWithoutCoordinates.map((stop) => {
      const stopFeature = this.stopsFeatureStore.get(stop.id);
      if (stopFeature) {
        this.stopsFeatureStore.delete(stopFeature);
      }
    });
  }

  private getRoutes(isOverview: boolean = false) {
    const stopsWithCoordinates = this.stopsStore.view
      .all()
      .filter((stop) => stop.coordinates);
    if (stopsWithCoordinates.length < 2) {
      this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
      return;
    }

    const roundedCoordinates = stopsWithCoordinates.map((stop) => {
      const roundedCoord = roundCoordTo(
        stop.coordinates,
        this.coordRoundedDecimals
      );
      return roundedCoord;
    });
    const overviewDirectionsOptions: DirectionOptions = {
      overview: true,
      steps: false,
      alternatives: false,
      continue_straight: false
    };
    this.routesQueries$$.map((u) => u.unsubscribe());
    const routeResponse = this.directionsService.route(
      roundedCoordinates,
      isOverview ? overviewDirectionsOptions : undefined
    );
    if (routeResponse) {
      routeResponse.map((res) =>
        this.routesQueries$$.push(
          res.subscribe((directions) => {
            this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
            directions.map((direction) =>
              addDirectionToRoutesFeatureStore(
                this.routesFeatureStore,
                direction,
                this.projection,
                direction === directions[0] ? true : false
              )
            );
          })
        )
      );
    }
  }

  public addStopOverlay(stop: Stop) {
    addStopToStopsFeatureStore(
      stop,
      this.stopsStore,
      this.stopsFeatureStore,
      this.projection,
      this.languageService
    );
  }

  onToggleDirectionsControl(toggle: boolean) {
    this.queryService.queryEnabled = !toggle;
    if (toggle) {
      this.interactions.map((interaction) =>
        this.routesFeatureStore.layer.map.ol.addInteraction(interaction)
      );
    } else {
      this.interactions.map((interaction) =>
        this.routesFeatureStore.layer.map.ol.removeInteraction(interaction)
      );
    }
  }
}

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { EntityStoreWatcher } from '@igo2/common/entity';
import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { ChangeUtils, ObjectUtils } from '@igo2/utils';

import Collection from 'ol/Collection';
import { Coordinate } from 'ol/coordinate';
import * as olCondition from 'ol/events/condition';
import * as olInteraction from 'ol/interaction';
import * as olProj from 'ol/proj';

import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { Feature } from '../feature/shared/feature.interfaces';
import { FeatureStoreLoadingStrategy } from '../feature/shared/strategies/loading';
import { roundCoordTo, roundCoordToString, stringToLonLat } from '../map';
import { QueryService } from '../query/shared/query.service';
import { SearchResult } from '../search/shared/search.interfaces';
import { SearchService } from '../search/shared/search.service';
import { DirectionsButtonsComponent } from './directions-buttons/directions-buttons.component';
import { DirectionsInputsComponent } from './directions-inputs/directions-inputs.component';
import { DirectionsResultsComponent } from './directions-results/directions-results.component';
import { BaseDirectionsSourceOptionsProfile } from './directions-sources';
import { DirectionsSourceService } from './shared/directions-source.service';
import { DirectionsType, ProposalType } from './shared/directions.enum';
import {
  DirectionOptions,
  FeatureWithDirections,
  FeatureWithStopProperties,
  Stop
} from './shared/directions.interface';
import { DirectionsService } from './shared/directions.service';
import {
  addRouteToRoutesFeatureStore,
  addStopToStopsFeatureStore,
  addStopToStore,
  initRoutesFeatureStore,
  initStepsFeatureStore,
  initStopsFeatureStore,
  updateStoreSorting
} from './shared/directions.utils';
import {
  RoutesFeatureStore,
  StepsFeatureStore,
  StopsFeatureStore,
  StopsStore
} from './shared/store';

@Component({
  selector: 'igo-directions',
  templateUrl: './directions.component.html',
  styleUrls: ['./directions.component.scss'],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    DirectionsButtonsComponent,
    DirectionsInputsComponent,
    DirectionsResultsComponent,
    IgoLanguageModule
  ]
})
export class DirectionsComponent implements OnInit, OnDestroy {
  private watcher: EntityStoreWatcher<Stop>;

  public projection = 'EPSG:4326';
  public hasOsrmPrivateAccess = false;
  public twoSourcesAvailable = false;

  private zoomOnActiveRoute$$: Subscription;
  private storeEmpty$$: Subscription;
  private storeChange$$: Subscription;
  private routesQueries$$: Subscription[] = [];

  private selectStopInteraction: olInteraction.Select;
  private translateStop: olInteraction.Translate;
  private selectedRoute: olInteraction.Select;
  private focusOnStop = false;
  private isTranslating = false;

  public previousStops: Stop[] = [];

  private searchs$$: Subscription[] = [];
  private authenticated$$: Subscription;

  @Input() contextUri: string;
  @Input({ required: true }) stopsStore: StopsStore;
  @Input({ required: true }) stopsFeatureStore: StopsFeatureStore;
  @Input({ required: true }) routesFeatureStore: RoutesFeatureStore;
  @Input({ required: true }) stepsFeatureStore: StepsFeatureStore;
  @Input() debounce = 200;
  @Input() length = 2;
  @Input() coordRoundedDecimals = 6;
  @Input({ required: true }) zoomOnActiveRoute$ = new Subject<void>();
  @Input({ required: true }) authenticated$: BehaviorSubject<boolean>;

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

  get enabledProfileHasAuthorization() {
    return this.directionsSourceService.sources[0].getEnabledProfile()
      .authorization;
  }

  constructor(
    private cdRef: ChangeDetectorRef,
    private http: HttpClient,
    private languageService: LanguageService,
    private directionsService: DirectionsService,
    private directionsSourceService: DirectionsSourceService,
    private searchService: SearchService,
    private queryService: QueryService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.authenticated$$ = this.authenticated$.subscribe(
      (authenticated: boolean) => {
        if (authenticated) {
          const profileWithAuth: BaseDirectionsSourceOptionsProfile =
            this.directionsSourceService.sources[0].getProfileWithAuthorization();
          if (profileWithAuth) {
            this.http
              .get(profileWithAuth.authorization.url)
              .subscribe((user) => {
                this.hasOsrmPrivateAccess =
                  user[profileWithAuth.authorization.property];
              });
          }
        }
      }
    );
    this.twoSourcesAvailable =
      this.directionsSourceService.sources[0].profiles.length === 2
        ? true
        : false;
    this.queryService.queryEnabled = false;
    this.initEntityStores();
    setTimeout(() => {
      initStopsFeatureStore(this.stopsFeatureStore, this.languageService);
      initRoutesFeatureStore(this.routesFeatureStore, this.languageService);
      initStepsFeatureStore(this.stepsFeatureStore);
      this.initOlInteraction();
    }, 1);
  }

  ngOnDestroy(): void {
    this.queryService.queryEnabled = true;
    this.storeEmpty$$.unsubscribe();
    this.storeChange$$.unsubscribe();
    this.routesQueries$$.map((u) => u.unsubscribe());
    this.zoomOnActiveRoute$$.unsubscribe();
    this.authenticated$$.unsubscribe();
    this.freezeStores();

    if (this.stopsFeatureStore.empty) {
      this.stopsFeatureStore.map.layerController.remove(
        this.stopsFeatureStore.layer
      );
    }
    if (this.routesFeatureStore.empty) {
      this.routesFeatureStore.map.layerController.remove(
        this.routesFeatureStore.layer
      );
    }
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
    this.stepsFeatureStore.deactivateStrategyOfType(
      FeatureStoreLoadingStrategy
    );
  }

  private initEntityStores() {
    this.watcher = new EntityStoreWatcher(this.stopsStore, this.cdRef);
    this.monitorEmptyEntityStore();
    this.monitorEntityStoreChange();
    this.monitorActiveRouteZoom();
  }

  private monitorActiveRouteZoom() {
    this.zoomOnActiveRoute$$ = this.zoomOnActiveRoute$.subscribe(() => {
      if (this.routesFeatureStore.count >= 1) {
        const activeRoute: FeatureWithDirections = this.routesFeatureStore
          .all()
          .find((route) => route.properties.active);

        if (activeRoute) {
          const stopsCoordinates: Coordinate[] = this.stopsStore
            .all()
            .map((stop) =>
              olProj.transform(stop.coordinates, 'EPSG:4326', 'EPSG:3857')
            );
          const routeCoordinates: Coordinate[] =
            activeRoute.geometry.coordinates;
          const coordinates: Coordinate[] = [
            ...stopsCoordinates,
            ...routeCoordinates
          ];
          const routeExtent = coordinates.reduce(
            ([x_min, y_min, x_max, y_max], [x, y]) => [
              Math.min(x_min, x),
              Math.min(y_min, y),
              Math.max(x_max, x),
              Math.max(y_max, y)
            ],
            [Infinity, Infinity, -Infinity, -Infinity]
          );
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
    this.translateStop.on('translating', (evt) => {
      this.isTranslating = true;
      this.executeStopTranslation(evt.features);
    });
    this.translateStop.on('translateend', (evt) => {
      this.isTranslating = false;
      this.executeStopTranslation(evt.features);
    });

    this.selectedRoute = new olInteraction.Select({
      layers: [this.routesFeatureStore.layer.ol],
      condition: olCondition.click,
      hitTolerance: 7,
      filter: (feature) => {
        return (
          feature.get('type') === DirectionsType.Route &&
          feature.get('active') &&
          !this.isTranslating
        );
      }
    });
    this.selectedRoute.on('select', (evt) => {
      if (this.focusOnStop === false) {
        const selectCoordinates: Coordinate = olProj.transform(
          (evt as any).mapBrowserEvent.coordinate,
          this.routesFeatureStore.layer.map.projection,
          this.projection
        );
        const addedStop: Stop = addStopToStore(this.stopsStore);
        addedStop.text = roundCoordToString(
          selectCoordinates,
          this.coordRoundedDecimals
        ).join(', ');
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
      translationCoordinates,
      this.coordRoundedDecimals
    );
    translatedStop.coordinates = roundedCoord;
    translatedStop.text = roundCoordToString(
      translationCoordinates,
      this.coordRoundedDecimals
    ).join(', ');
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
      .subscribe((stops) => {
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
    const simplifiedStops = stops.map((stop) => {
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
          let isCoord = false;
          if (response.lonLat) {
            isCoord = true;
          }
          const researches = this.searchService.search(term, {
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
                map((results) =>
                  results.filter((r) =>
                    isCoord
                      ? r.data.geometry.type === 'Point' && r.data.geometry
                      : r.data.geometry
                  )
                )
              )
              .subscribe((res) => {
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
                  const storedSource = stop.searchProposals.find(
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

  private getRoutes(isOverview = false) {
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
      this.routesQueries$$.push(
        routeResponse.subscribe((directions) => {
          this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
          directions.map((direction) =>
            addRouteToRoutesFeatureStore(
              this.routesFeatureStore,
              direction,
              this.projection,
              direction === directions[0] ? true : false
            )
          );
        })
      );
    }
  }

  public addStopOverlay(stop: Stop) {
    addStopToStopsFeatureStore(
      stop,
      this.stopsFeatureStore,
      this.projection,
      this.languageService
    );
  }

  onToggleDirectionsControl(isActive: boolean) {
    this.queryService.queryEnabled = !isActive;
    const ol = this.routesFeatureStore.layer.map.ol;
    this.interactions.map((interaction) =>
      isActive
        ? ol.addInteraction(interaction)
        : ol.removeInteraction(interaction)
    );
  }

  onTogglePrivateModeControl(isActive: boolean) {
    this.directionsSourceService.sources[0].profiles.forEach(
      (profile) => (profile.enabled = false)
    );
    if (isActive) {
      this.directionsSourceService.sources[0].profiles.find(
        (profile) => profile.authorization
      ).enabled = true;
      this.messageService.alert(
        this.languageService.translate.instant(
          'igo.geo.directions.forestRoadsWarning.text'
        ),
        this.languageService.translate.instant(
          'igo.geo.directions.forestRoadsWarning.title'
        )
      );
    } else {
      this.directionsSourceService.sources[0].profiles.find(
        (profile) => !profile.authorization
      ).enabled = true;
    }
    this.getRoutes();
  }
}

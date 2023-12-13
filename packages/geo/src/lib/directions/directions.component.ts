import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import { EntityStoreWatcher } from '@igo2/common';
import { LanguageService } from '@igo2/core';
import { ChangeUtils, ObjectUtils } from '@igo2/utils';

import Collection from 'ol/Collection';
import * as olCondition from 'ol/events/condition';
import * as olInteraction from 'ol/interaction';
import { SelectEvent } from 'ol/interaction/Select';
import { TranslateEvent } from 'ol/interaction/Translate';
import * as olProj from 'ol/proj';

import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { Feature } from '../feature/shared/feature.interfaces';
import { FeatureStoreLoadingStrategy } from '../feature/shared/strategies/loading';
import { roundCoordTo, stringToLonLat } from '../map';
import { QueryService } from '../query/shared/query.service';
import { Research, SearchResult } from '../search/shared/search.interfaces';
import { SearchService } from '../search/shared/search.service';
import { DirectionType, ProposalType } from './shared/directions.enum';
import {
  RouteOptions,
  FeatureWithWaypointProperties,
  Waypoint,
  Route
} from './shared/directions.interface';
import { DirectionsService } from './shared/directions.service';
import { Observable, Subject, Subscription } from 'rxjs';
import {
  addRouteToRouteFeatureStore,
  addWaypointToWaypointFeatureStore,
  addWaypointToStore,
  initRoutesFeatureStore,
  initStepFeatureStore,
  initWaypointFeatureStore,
  updateStoreSorting
} from './shared/directions.utils';
import {
  RoutesFeatureStore,
  StepFeatureStore,
  WaypointFeatureStore,
  WaypointStore
} from './shared/store';
import { Position } from 'geojson';

@Component({
  selector: 'igo-directions',
  templateUrl: './directions.component.html',
  styleUrls: ['./directions.component.scss']
})
export class DirectionsComponent implements OnInit, OnDestroy {
  private watcher: EntityStoreWatcher<Waypoint>;

  public projection: string = 'EPSG:4326';

  private zoomRoute$$: Subscription;
  private storeEmpty$$: Subscription;
  private storeChange$$: Subscription;
  private routesQueries$$: Subscription[] = [];

  private selectWaypointInteraction: olInteraction.Select;
  private translateWaypoint: olInteraction.Translate;
  private selectedRoute: olInteraction.Select;
  private focusOnWaypoint: boolean = false;
  private isTranslating: boolean = false;

  public previousWaypoints: Waypoint[] = [];

  private searchs$$: Subscription[] = [];

  @Input() contextUri: string;
  @Input() waypointStore: WaypointStore;
  @Input() waypointFeatureStore: WaypointFeatureStore;
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
    return [this.selectWaypointInteraction, this.translateWaypoint, this.selectedRoute];
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
      initWaypointFeatureStore(this.waypointFeatureStore, this.languageService);
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
    this.waypointFeatureStore.deactivateStrategyOfType(
      FeatureStoreLoadingStrategy
    );
    this.routesFeatureStore.deactivateStrategyOfType(
      FeatureStoreLoadingStrategy
    );
    this.stepFeatureStore.deactivateStrategyOfType(FeatureStoreLoadingStrategy);
  }

  private initEntityStores() {
    this.watcher = new EntityStoreWatcher(this.waypointStore, this.cdRef);
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
    this.selectWaypointInteraction = new olInteraction.Select({
      layers: [this.waypointFeatureStore.layer.ol],
      hitTolerance: 7,
      condition: (event) => {
        return event.type === 'pointermove' && !event.dragging;
      }
    });

    this.translateWaypoint = new olInteraction.Translate({
      features: this.selectWaypointInteraction.getFeatures()
    });
    this.translateWaypoint.on('translating', (evt: TranslateEvent) => {
      this.isTranslating = true;
      this.executeWaypointTranslation(evt.features);
    });
    this.translateWaypoint.on('translateend', (evt: TranslateEvent) => {
      this.isTranslating = false;
      this.executeWaypointTranslation(evt.features);
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
      if (this.focusOnWaypoint === false) {
        const selectCoordinates = roundCoordTo(
          olProj.transform(
            (evt as any).mapBrowserEvent.coordinate,
            this.routesFeatureStore.layer.map.projection,
            this.projection
          ) as [number, number],
          this.coordRoundedDecimals
        );
        const addedWaypoint: Waypoint = addWaypointToStore(this.waypointStore);
        addedWaypoint.text = selectCoordinates.join(',');
        addedWaypoint.coordinates = [selectCoordinates[0], selectCoordinates[1]];
      }
    });

    this.interactions.map((interaction) =>
      this.routesFeatureStore.layer.map.ol.addInteraction(interaction)
    );
  }

  onWaypointInputHasFocusChange(waypointInputHasFocus: boolean) {
    waypointInputHasFocus
      ? this.routesFeatureStore.layer.map.ol.removeInteraction(
          this.selectedRoute
        )
      : this.routesFeatureStore.layer.map.ol.addInteraction(this.selectedRoute);
  }

  private executeWaypointTranslation(features: Collection<any>) {
    if (features.getLength() === 0) {
      return;
    }
    const firstFeature = features.getArray()[0];
    const translatedWaypointId = firstFeature.getId();

    const translationCoordinates = olProj.transform(
      firstFeature.getGeometry().getCoordinates(),
      this.waypointFeatureStore.layer.map.projection,
      this.projection
    );
    const translatedWaypoint = this.waypointStore.get(translatedWaypointId);
    const roundedCoord = roundCoordTo(
      translationCoordinates as [number, number],
      this.coordRoundedDecimals
    );
    translatedWaypoint.coordinates = roundedCoord;
    translatedWaypoint.text = roundedCoord.join(',');
    this.waypointStore.update(translatedWaypoint);
  }

  private monitorEmptyEntityStore() {
    // Watch if the store is empty to reset it
    this.storeEmpty$$ = this.waypointStore.count$
      .pipe(distinctUntilChanged())
      .subscribe((count) => {
        if (count < 2) {
          addWaypointToStore(this.waypointStore);
          if (this.waypointStore.count === 2) {
            this.waypointStore.storeInitialized$.next(true);
            return;
          }
          this.waypointStore.storeInitialized$.next(false);
        }
        this.routesQueries$$.map((u) => u.unsubscribe());
      });
  }

  private monitorEntityStoreChange() {
    this.storeChange$$ = this.waypointStore.entities$
      .pipe(debounceTime(this.debounce))
      .subscribe((waypoints: Waypoint[]) => {
        this.handleWaypointDiff(waypoints);
        updateStoreSorting(this.waypointStore);
        this.handleWaypointFeatures();
        this.getRoutes(this.isTranslating);
      });
  }

  cancelSearch() {
    this.searchs$$.map((s) => s.unsubscribe());
  }

  private handleWaypointDiff(waypoints: Waypoint[]) {
    const simplifiedWaypoints: Waypoint[] = waypoints.map((waypoint: Waypoint) => {
      return ObjectUtils.removeUndefined({
        ...{ id: waypoint.id, text: waypoint.text, coordinates: waypoint.coordinates }
      });
    });
    const diff = ChangeUtils.findChanges(this.previousWaypoints, simplifiedWaypoints, [
      'coordinates'
    ]);
    const waypointIdToProcess = diff.added.concat(diff.modified);
    if (waypointIdToProcess) {
      waypointIdToProcess.map((change) => {
        const changedWaypoint = change.newValue as Waypoint;
        if (changedWaypoint) {
          const waypoint: Waypoint = this.waypointStore.get(changedWaypoint.id);
          const term: string = waypoint.text;
          if (!term || term.length === 0) {
            return;
          }
          const response = stringToLonLat(
            term,
            this.waypointFeatureStore.layer.map.projection
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
                  if (!waypoint.searchProposals) {
                    waypoint.searchProposals = [];
                  }
                  waypoint.searchProposals = waypoint.searchProposals.filter(
                    (sp) =>
                      sp.type ===
                      (isCoord ? ProposalType.Coord : ProposalType.Text)
                  );
                  let storedSource = waypoint.searchProposals.find(
                    (sp) => sp.source === source
                  );
                  if (storedSource) {
                    storedSource.results = results;
                  } else {
                    waypoint.searchProposals.push({
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
    this.previousWaypoints = simplifiedWaypoints;
  }

  private handleWaypointFeatures() {
    const waypoints: Waypoint[] = this.waypointStore.all();
    const waypointsWithCoordinates = waypoints.filter((waypoint: Waypoint) => waypoint.coordinates);
    waypointsWithCoordinates.map((waypoint: Waypoint) => this.addWaypointOverlay(waypoint));
    this.waypointFeatureStore
      .all()
      .map((waypointFeature: Feature<FeatureWithWaypointProperties>) => {
        if (!this.waypointStore.get(waypointFeature.properties.id)) {
          this.waypointFeatureStore.delete(waypointFeature);
        }
      });
    const waypointsWithoutCoordinates: Waypoint[] = waypoints.filter((waypoint: Waypoint) => !waypoint.coordinates);
    waypointsWithoutCoordinates.map((waypoint: Waypoint) => {
      const waypointFeature = this.waypointFeatureStore.get(waypoint.id);
      if (waypointFeature) {
        this.waypointFeatureStore.delete(waypointFeature);
      }
    });
  }

  private getRoutes(isOverview: boolean = false) {
    const waypointsWithCoordinates: Waypoint[] = this.waypointStore.view
      .all()
      .filter((waypoint: Waypoint) => waypoint.coordinates);
    if (waypointsWithCoordinates.length < 2) {
      this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
      return;
    }

    const roundedCoordinates: Position[] = waypointsWithCoordinates.map((waypoint: Waypoint) => {
      const roundedCoord: Position = roundCoordTo(
        waypoint.coordinates,
        this.coordRoundedDecimals
      );
      return roundedCoord;
    });
    const overviewRouteOptions: RouteOptions = {
      overview: 'simplified',
      steps: false,
      alternatives: false,
      continue_straight: false
    };
    this.routesQueries$$.map((u) => u.unsubscribe());
    const routeResponse: Observable<Route[]>[] = this.directionsService.route(
      roundedCoordinates,
      isOverview ? overviewRouteOptions : undefined
    );
    if (routeResponse) {
      routeResponse.map((response: Observable<Route[]>) =>
        this.routesQueries$$.push(
          response.subscribe((routes: Route[]) => {
            this.routesFeatureStore.deleteMany(this.routesFeatureStore.all());
            routes.map((route: Route) =>
              addRouteToRouteFeatureStore(
                this.routesFeatureStore,
                route,
                this.projection,
                route === routes[0] ? true : false
              )
            );
          })
        )
      );
    }
  }

  public addWaypointOverlay(waypoint: Waypoint) {
    addWaypointToWaypointFeatureStore(
      waypoint,
      this.waypointFeatureStore,
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
}

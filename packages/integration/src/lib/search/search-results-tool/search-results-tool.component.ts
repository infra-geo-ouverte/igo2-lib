import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SanitizeHtmlPipe } from '@igo2/common/custom-html';
import { EntityStore, getEntityTitle } from '@igo2/common/entity';
import { FlexibleComponent, FlexibleState } from '@igo2/common/flexible';
import { PanelComponent } from '@igo2/common/panel';
import { ToolComponent } from '@igo2/common/tool';
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';
import {
  FEATURE,
  Feature,
  FeatureDetailsComponent,
  FeatureMotion,
  FeatureStore,
  IgoMap,
  LayerSearchResultsOlStyleFunction,
  Overlay,
  Research,
  SearchResult,
  SearchResultAddButtonComponent,
  SearchResultsComponent,
  computeOlFeaturesExtent,
  featureToOl,
  featuresAreOutOfView,
  moveToOlFeatures,
  roundCoordTo
} from '@igo2/geo';

import { Coordinate } from 'ol/coordinate';
import olFormatGeoJSON from 'ol/format/GeoJSON';
import * as olProj from 'ol/proj';

import pointOnFeature from '@turf/point-on-feature';
import { BehaviorSubject, Observable, Subscription, combineLatest } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { DirectionState } from '../../directions/directions.state';
import { MapState } from '../../map/map.state';
import { ToolState } from '../../tool/tool.state';
import { SearchState } from '../search.state';

/**
 * Tool to browse the search results
 */
@ToolComponent({
  name: 'searchResults',
  title: 'igo.integration.tools.searchResults',
  icon: 'search'
})
@Component({
  selector: 'igo-search-results-tool',
  templateUrl: './search-results-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
        padding: 16px;
      }
    `
  ],
  imports: [
    FlexibleComponent,
    SearchResultsComponent,
    SearchResultAddButtonComponent,
    PanelComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    FeatureDetailsComponent,
    AsyncPipe,
    IgoLanguageModule,
    SanitizeHtmlPipe
  ]
})
export class SearchResultsToolComponent implements OnInit, OnDestroy {
  private mapState = inject(MapState);
  private searchState = inject(SearchState);
  private elRef = inject(ElementRef);
  toolState = inject(ToolState);
  private directionState = inject(DirectionState);

  /**
   * to show hide results icons
   */
  @Input() showIcons = true;

  /**
   * Determine the top panel default state
   */
  @Input() topPanelStateDefault = 'expanded';

  private searchResultsOverlayAll$$: Subscription;

  public saveSearchResultInLayer = false;

  private searchResultsOverlayFocused: Overlay;
  private searchResultsOverlaySelected: Overlay;
  private searchResultsOverlayAll: Overlay;

  private getRoute$$: Subscription;
  public isSelectedResultOutOfView$ = new BehaviorSubject(false);
  private isSelectedResultOutOfView$$: Subscription;

  public debouncedEmpty$ = new BehaviorSubject<boolean>(true);
  private debouncedEmpty$$: Subscription;

  /**
   * Store holding the search results
   * @internal
   */
  get store(): EntityStore<SearchResult> {
    return this.searchState.store;
  }

  /**
   * Map to display the results on
   * @internal
   */
  get map(): IgoMap {
    return this.mapState.map;
  }

  get featureTitle(): string {
    return this.feature ? getEntityTitle(this.feature) : undefined;
  }

  get feature$(): Observable<Feature> {
    return this.store.stateView
      .firstBy$((e) => e.state.focused)
      .pipe(
        map(
          (element) =>
            (this.feature = element
              ? (element.entity.data as Feature)
              : undefined)
        )
      );
  }

  public feature: Feature;

  public term = '';
  private searchTerm$$: Subscription;

  public settingsChange$ = new BehaviorSubject<boolean>(undefined);

  public topPanelState$ = new BehaviorSubject<FlexibleState>('initial');
  private topPanelState$$: Subscription;

  @Input()
  set topPanelState(value: FlexibleState) {
    this.topPanelState$.next(value);
  }
  get topPanelState(): FlexibleState {
    return this.topPanelState$.value;
  }

  get termSplitter(): string {
    return this.searchState.searchTermSplitter$.value;
  }

  private format = new olFormatGeoJSON();

  get stores(): FeatureStore<Feature>[] {
    return this.searchState.searchLayerStores;
  }

  constructor() {
    const configService = inject(ConfigService);

    this.saveSearchResultInLayer = configService.getConfig(
      'saveSearchResultInLayer'
    );
    this.handleShowAllResults();
  }

  ngOnInit() {
    this.searchResultsOverlayFocused = new Overlay(this.mapState.map);
    this.searchResultsOverlayFocused.setLayerOlStyle(
      LayerSearchResultsOlStyleFunction(this.mapState.map, 'focus')
    );
    this.searchResultsOverlaySelected = new Overlay(this.mapState.map);
    this.searchResultsOverlaySelected.setLayerOlStyle(
      LayerSearchResultsOlStyleFunction(this.mapState.map, 'selection')
    );
    this.searchResultsOverlayAll = new Overlay(this.mapState.map);
    this.searchResultsOverlayAll.setLayerOlStyle(
      LayerSearchResultsOlStyleFunction(this.mapState.map)
    );
    this.searchTerm$$ = this.searchState.searchTerm$.subscribe(
      (searchTerm: string) => {
        if (
          searchTerm !== undefined &&
          searchTerm !== null &&
          searchTerm !== ''
        ) {
          this.term = searchTerm;
          this.debouncedEmpty$.next(false);
        } else if (searchTerm === '') {
          this.debouncedEmpty$.next(true);
        }
      }
    );

    for (const res of this.store.stateView.all$().value) {
      if (this.store.state.get(res.entity).selected === true) {
        this.topPanelState = 'expanded';
      }
    }

    this.searchState.searchSettingsChange$.subscribe(() => {
      this.settingsChange$.next(true);
    });

    this.topPanelState$$ = this.topPanelState$.subscribe(() => {
      const igoList = this.computeElementRef()[0];
      const selected = this.computeElementRef()[1];
      if (selected) {
        setTimeout(() => {
          // To be sure the flexible component has been displayed yet
          if (!this.isScrolledIntoView(igoList, selected)) {
            this.adjustTopPanel(igoList, selected);
          }
        }, FlexibleComponent.transitionTime + 50);
      }
    });

    this.monitorResultOutOfView();

    this.debouncedEmpty$$ = this.store.stateView.empty$
      .pipe(debounceTime(1500))
      .subscribe((empty) => this.debouncedEmpty$.next(empty));
  }

  handleShowAllResults() {
    this.searchResultsOverlayAll$$ = combineLatest([
      this.store.entities$,
      this.searchState.searchResultsGeometryEnabled$
    ]).subscribe((bunch) => {
      const searchResults = bunch[0];
      const enabled = bunch[1];
      const rec = searchResults
        .filter((sr) => sr.meta.dataType === FEATURE)
        .map((sr) => sr.data as Feature);
      if (enabled && rec.length) {
        this.searchResultsOverlayAll.setFeatures(rec, FeatureMotion.None);
      } else {
        this.searchResultsOverlayFocused.clear();
        this.searchResultsOverlaySelected.clear();
        this.searchResultsOverlayAll.clear();
      }
    });
  }

  private monitorResultOutOfView() {
    this.isSelectedResultOutOfView$$ = combineLatest([
      this.map.viewController.state$,
      this.searchState.selectedResult$
    ])
      .pipe(debounceTime(100))
      .subscribe((bunch) => {
        const selectedResult = bunch[1] as SearchResult<Feature>;
        if (!selectedResult) {
          this.isSelectedResultOutOfView$.next(false);
          return;
        }
        if (selectedResult.data.geometry) {
          const selectedOlFeature = featureToOl(
            selectedResult.data,
            this.map.projectionCode
          );
          const selectedOlFeatureExtent = computeOlFeaturesExtent(
            [selectedOlFeature],
            this.map.viewController.getOlProjection()
          );
          this.isSelectedResultOutOfView$.next(
            featuresAreOutOfView(
              this.map.viewController.getExtent(),
              selectedOlFeatureExtent
            )
          );
        }
      });
  }

  ngOnDestroy() {
    this.topPanelState$$.unsubscribe();
    this.searchTerm$$.unsubscribe();
    if (this.isSelectedResultOutOfView$$) {
      this.isSelectedResultOutOfView$$.unsubscribe();
    }
    if (this.searchResultsOverlayAll$$) {
      this.searchResultsOverlayAll$$.unsubscribe();
    }
    if (this.getRoute$$) {
      this.getRoute$$.unsubscribe();
    }
    if (this.debouncedEmpty$$) {
      this.debouncedEmpty$$.unsubscribe();
    }
  }

  /**
   * Try to add a feature to the map when it's being focused
   * @internal
   * @param result A search result that could be a feature
   */
  onResultFocus(result: SearchResult) {
    if (this.store.state.get(result).selected) {
      this.searchResultsOverlayFocused.clear();
    } else {
      this.addResultToOverlay(
        result,
        this.searchResultsOverlayFocused,
        this.searchState.featureMotion.selected
      );
    }
  }

  onResultUnfocus(result: SearchResult) {
    if (!this.store.state.get(result).selected) {
      this.searchResultsOverlayFocused.clear();
    }
  }

  /**
   * Try to add a feature to the map when it's being selected
   * @internal
   * @param result A search result that could be a feature or some layer options
   */
  onResultSelect(result: SearchResult) {
    this.searchResultsOverlayFocused.clear();
    this.searchResultsOverlaySelected.clear();
    this.addResultToOverlay(
      result,
      this.searchResultsOverlaySelected,
      this.searchState.featureMotion.selected
    );
    this.searchState.setSelectedResult(result);

    if (this.topPanelState === 'initial') {
      if (this.topPanelStateDefault !== 'collapsed') {
        this.topPanelState = 'expanded';
      } else {
        this.topPanelState = 'collapsed';
      }
    }

    if (this.topPanelState === 'expanded') {
      const igoList = this.computeElementRef()[0];
      const selected = this.computeElementRef()[1];
      if (!this.isScrolledIntoView(igoList, selected)) {
        this.adjustTopPanel(igoList, selected);
      }
    }
  }

  onSearch(event: { research: Research; results: SearchResult[] }) {
    const results = event.results;
    const newResults = this.store.entities$.value
      .filter((result: SearchResult) => result.source !== event.research.source)
      .concat(results);

    this.store.load(newResults);

    for (const res of this.store.all()) {
      if (
        this.store.state.get(res).focused === true &&
        this.store.state.get(res).selected !== true
      ) {
        this.store.state.update(res, { focused: false }, true);
      }
    }

    setTimeout(() => {
      const igoList = this.elRef.nativeElement.querySelector('igo-list');
      let moreResults;
      event.research.request.subscribe((source) => {
        if (!source[0] || !source[0].source) {
          moreResults = null;
        } else if (source[0].source.getId() === 'icherche') {
          moreResults = igoList.querySelector('.icherche .moreResults');
        } else if (source[0].source.getId() === 'ilayer') {
          moreResults = igoList.querySelector('.ilayer .moreResults');
        } else if (source[0].source.getId() === 'nominatim') {
          moreResults = igoList.querySelector('.nominatim .moreResults');
        } else {
          moreResults = igoList.querySelector(
            '.' + source[0].source.getId() + ' .moreResults'
          );
        }

        if (
          moreResults !== null &&
          !this.isScrolledIntoView(igoList, moreResults)
        ) {
          igoList.scrollTop =
            moreResults.offsetTop +
            moreResults.offsetHeight -
            igoList.clientHeight;
        }
      });
    }, 250);
  }

  computeElementRef() {
    const items = document.getElementsByTagName('igo-search-results-item');
    const igoList =
      this.elRef.nativeElement.getElementsByTagName('igo-list')[0];
    let selectedItem;

    for (let i = 0; i < items.length; i++) {
      if (items[i].className.includes('igo-list-item-selected')) {
        selectedItem = items[i];
      }
    }
    return [igoList, selectedItem];
  }

  adjustTopPanel(elemSource, elem) {
    if (!this.isScrolledIntoView(elemSource, elem)) {
      elemSource.scrollTop =
        elem.offsetTop +
        elem.children[0].offsetHeight -
        elemSource.clientHeight;
    }
  }

  toggleTopPanel(event?: MouseEvent) {
    if (event && (event.target as any)?.className !== 'igo-panel-title') {
      return;
    } else {
      if (this.topPanelState === 'expanded') {
        this.topPanelState = 'collapsed';
      } else {
        this.topPanelState = 'expanded';
      }
    }
  }

  zoomToFeatureExtent() {
    if (this.feature.geometry) {
      const localOlFeature = this.format.readFeature(this.feature, {
        dataProjection: this.feature.projection,
        featureProjection: this.map.projectionCode
      });
      moveToOlFeatures(
        this.map.viewController,
        localOlFeature,
        FeatureMotion.Zoom
      );
    }
  }

  /**
   * Try to add a feature to the map overlay
   * @param result A search result that could be a feature
   * @param motion A FeatureMotion to trigger when adding the searchresult to the map search overlay
   */
  private addResultToOverlay(
    result: SearchResult,
    overlay: Overlay,
    motion: FeatureMotion = FeatureMotion.Default
  ) {
    if (result.meta.dataType !== FEATURE) {
      return undefined;
    }
    const feature = (result as SearchResult<Feature>).data;

    // Sometimes features have no geometry. It happens with some GetFeatureInfo
    if (!feature.geometry) {
      return;
    }
    overlay.setFeatures([feature], motion);
  }

  isScrolledIntoView(elemSource, elem) {
    const padding = 6;
    const docViewTop = elemSource.scrollTop;
    const docViewBottom = docViewTop + elemSource.clientHeight;

    const elemTop = elem.offsetTop;
    const elemBottom = elemTop + elem.clientHeight + padding;
    return elemBottom <= docViewBottom && elemTop >= docViewTop;
  }

  getRoute() {
    this.toolState.toolbox.activateTool('directions');
    this.directionState.stopsStore.clearStops();
    setTimeout(() => {
      let routingCoordLoaded = false;
      if (this.getRoute$$) {
        this.getRoute$$.unsubscribe();
      }
      this.getRoute$$ =
        this.directionState.stopsStore.storeInitialized$.subscribe(() => {
          if (
            this.directionState.stopsStore.storeInitialized$.value &&
            !routingCoordLoaded
          ) {
            routingCoordLoaded = true;
            const stop = this.directionState.stopsStore
              .all()
              .find((e) => e.position === 1);
            let coord;
            if (this.feature.geometry) {
              if (this.feature.geometry.type === 'Point') {
                coord = [
                  this.feature.geometry.coordinates[0],
                  this.feature.geometry.coordinates[1]
                ];
              } else {
                const point = pointOnFeature(this.feature.geometry);
                coord = [
                  point.geometry.coordinates[0],
                  point.geometry.coordinates[1]
                ];
              }
            }
            stop.text = this.featureTitle;
            stop.coordinates = coord;
            this.directionState.stopsStore.update(stop);
            if (this.map.geolocationController.position$.value) {
              const currentPos = this.map.geolocationController.position$.value;
              const stop = this.directionState.stopsStore
                .all()
                .find((e) => e.position === 0);
              const currentCoord = olProj.transform(
                currentPos.position,
                currentPos.projection,
                'EPSG:4326'
              );
              const coord: Coordinate = roundCoordTo(
                [currentCoord[0], currentCoord[1]],
                6
              );
              stop.text = coord.join(',');
              stop.coordinates = coord;
              this.directionState.stopsStore.update(stop);
            }
          }
        });
    }, 250);
  }
}

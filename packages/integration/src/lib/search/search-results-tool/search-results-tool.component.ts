import { AsyncPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SanitizeHtmlPipe } from '@igo2/common/custom-html';
import { EntityState, EntityStore, getEntityTitle } from '@igo2/common/entity';
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
  Research,
  SearchResult,
  SearchResultAddButtonComponent,
  SearchResultsComponent,
  computeOlFeaturesExtent,
  featureFromOl,
  featureToOl,
  featuresAreOutOfView,
  featuresAreTooDeepInView,
  getCommonVectorSelectedStyle,
  getCommonVectorStyle,
  moveToOlFeatures,
  roundCoordTo
} from '@igo2/geo';

import olFeature from 'ol/Feature';
import { Coordinate } from 'ol/coordinate';
import olFormatGeoJSON from 'ol/format/GeoJSON';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import olPoint from 'ol/geom/Point';
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
    NgIf,
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
  /**
   * to show hide results icons
   */
  @Input() showIcons = true;

  /**
   * Determine the top panel default state
   */
  @Input() topPanelStateDefault = 'expanded';

  private hasFeatureEmphasisOnSelection = false;
  public saveSearchResultInLayer = false;

  private showResultsGeometries$$: Subscription;
  private getRoute$$: Subscription;
  private shownResultsGeometries: Feature[] = [];
  private shownResultsEmphasisGeometries: Feature[] = [];
  private focusedResult$ = new BehaviorSubject<SearchResult>(undefined);
  public isSelectedResultOutOfView$ = new BehaviorSubject(false);
  private isSelectedResultOutOfView$$: Subscription;
  private abstractFocusedResult: Feature;
  private abstractSelectedResult: Feature;

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

  constructor(
    private mapState: MapState,
    private searchState: SearchState,
    private elRef: ElementRef,
    public toolState: ToolState,
    private directionState: DirectionState,
    configService: ConfigService
  ) {
    this.hasFeatureEmphasisOnSelection = configService.getConfig(
      'hasFeatureEmphasisOnSelection'
    );
    this.saveSearchResultInLayer = configService.getConfig(
      'saveSearchResultInLayer'
    );
  }

  ngOnInit() {
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

    if (this.hasFeatureEmphasisOnSelection) {
      if (!this.searchState.focusedOrResolution$$) {
        this.searchState.focusedOrResolution$$ = combineLatest([
          this.focusedResult$,
          this.map.viewController.resolution$
        ]).subscribe((bunch: [SearchResult<Feature>, number]) =>
          this.buildResultEmphasis(bunch[0], 'focused')
        );
      }

      if (!this.searchState.selectedOrResolution$$) {
        this.searchState.selectedOrResolution$$ = combineLatest([
          this.searchState.selectedResult$,
          this.map.viewController.resolution$
        ]).subscribe((bunch: [SearchResult<Feature>, number]) =>
          this.buildResultEmphasis(bunch[0], 'selected')
        );
      }
    }
    this.monitorResultOutOfView();

    this.showResultsGeometries$$ = combineLatest([
      this.searchState.searchResultsGeometryEnabled$,
      this.store.stateView.all$(),
      this.focusedResult$,
      this.searchState.selectedResult$,
      this.searchState.searchTerm$,
      this.map.viewController.resolution$
    ]).subscribe(
      (
        bunch: [
          boolean,
          { entity: SearchResult; state: EntityState }[],
          SearchResult,
          SearchResult,
          string,
          number
        ]
      ) => {
        const searchResultsGeometryEnabled = bunch[0];
        const searchResults = bunch[1];

        if (this.hasFeatureEmphasisOnSelection) {
          this.clearFeatureEmphasis('shown');
        }
        this.shownResultsGeometries.map((result) =>
          this.map.queryResultsOverlay.removeFeature(result)
        );
        const featureToHandleGeom = searchResults.filter(
          (result) =>
            result.entity.meta.dataType === FEATURE &&
            result.entity.data.geometry &&
            !result.state.selected &&
            !result.state.focused
        );

        featureToHandleGeom.map((result) => {
          if (searchResultsGeometryEnabled) {
            result.entity.data.meta.style = getCommonVectorStyle(
              Object.assign(
                {},
                {
                  feature: result.entity.data as Feature | olFeature<OlGeometry>
                },
                this.searchState.searchOverlayStyle,
                result.entity.style?.base ? result.entity.style.base : {}
              )
            );
            this.shownResultsGeometries.push(result.entity.data as Feature);
            this.map.queryResultsOverlay.addFeature(
              result.entity.data as Feature,
              FeatureMotion.None
            );
            if (this.hasFeatureEmphasisOnSelection) {
              this.buildResultEmphasis(
                result.entity as SearchResult<Feature>,
                'shown'
              );
            }
          }
        });
      }
    );

    this.debouncedEmpty$$ = this.store.stateView.empty$
      .pipe(debounceTime(1500))
      .subscribe((empty) => this.debouncedEmpty$.next(empty));
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
            this.map.projection
          );
          const selectedOlFeatureExtent = computeOlFeaturesExtent(
            [selectedOlFeature],
            this.map.viewController.getOlProjection()
          );
          this.isSelectedResultOutOfView$.next(
            featuresAreOutOfView(this.map.getExtent(), selectedOlFeatureExtent)
          );
        }
      });
  }

  private buildResultEmphasis(
    result: SearchResult<Feature>,
    trigger: 'selected' | 'focused' | 'shown' | undefined
  ) {
    if (trigger !== 'shown') {
      this.clearFeatureEmphasis(trigger);
    }
    if (!result || !result.data.geometry) {
      return;
    }
    const myOlFeature = featureToOl(result.data, this.map.projection);
    const olGeometry = myOlFeature.getGeometry();
    if (
      featuresAreTooDeepInView(
        this.map.viewController,
        olGeometry.getExtent() as [number, number, number, number],
        0.0025
      )
    ) {
      const extent = olGeometry.getExtent();
      const x = extent[0] + (extent[2] - extent[0]) / 2;
      const y = extent[1] + (extent[3] - extent[1]) / 2;
      const feature1 = new olFeature({
        name: `${trigger}AbstractResult'`,
        geometry: new olPoint([x, y])
      });
      const abstractResult = featureFromOl(feature1, this.map.projection);

      let computedStyle;
      let zIndexOffset = 0;

      switch (trigger) {
        case 'focused':
          computedStyle = getCommonVectorSelectedStyle(
            Object.assign(
              {},
              { feature: abstractResult },
              this.searchState.searchOverlayStyleFocus,
              result.style?.focus ? result.style.focus : {}
            )
          );
          zIndexOffset = 2;
          break;
        case 'shown':
          computedStyle = getCommonVectorStyle(
            Object.assign(
              {},
              { feature: abstractResult },
              this.searchState.searchOverlayStyle,
              result.style?.base ? result.style.base : {}
            )
          );
          break;
        case 'selected':
          computedStyle = getCommonVectorSelectedStyle(
            Object.assign(
              {},
              { feature: abstractResult },
              this.searchState.searchOverlayStyleSelection,
              result.style?.selection ? result.style.selection : {}
            )
          );
          zIndexOffset = 1;
          break;
      }
      abstractResult.meta.style = computedStyle;
      abstractResult.meta.style.setZIndex(2000 + zIndexOffset);
      this.map.searchResultsOverlay.addFeature(
        abstractResult,
        this.searchState.featureMotion.focus
      );
      if (trigger === 'focused') {
        this.abstractFocusedResult = abstractResult;
      }
      if (trigger === 'selected') {
        this.abstractSelectedResult = abstractResult;
      }
      if (trigger === 'shown') {
        this.shownResultsEmphasisGeometries.push(abstractResult);
      }
    } else {
      this.clearFeatureEmphasis(trigger);
    }
  }

  private clearFeatureEmphasis(trigger: 'selected' | 'focused' | 'shown') {
    if (trigger === 'focused' && this.abstractFocusedResult) {
      this.map.searchResultsOverlay.removeFeature(this.abstractFocusedResult);
      this.abstractFocusedResult = undefined;
    }
    if (trigger === 'selected' && this.abstractSelectedResult) {
      this.map.searchResultsOverlay.removeFeature(this.abstractSelectedResult);
      this.abstractSelectedResult = undefined;
    }
    if (trigger === 'shown') {
      this.shownResultsEmphasisGeometries.map((shownResult) =>
        this.map.searchResultsOverlay.removeFeature(shownResult)
      );
      this.shownResultsEmphasisGeometries = [];
    }
  }

  ngOnDestroy() {
    this.topPanelState$$.unsubscribe();
    this.searchTerm$$.unsubscribe();
    if (this.isSelectedResultOutOfView$$) {
      this.isSelectedResultOutOfView$$.unsubscribe();
    }
    if (this.showResultsGeometries$$) {
      this.showResultsGeometries$$.unsubscribe();
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
    this.focusedResult$.next(result);
    if (result.meta.dataType === FEATURE && result.data.geometry) {
      result.data.meta.style = getCommonVectorSelectedStyle(
        Object.assign(
          {},
          { feature: result.data as Feature | olFeature<OlGeometry> },
          this.searchState.searchOverlayStyleFocus,
          result.style?.focus ? result.style.focus : {}
        )
      );

      const feature =
        this.map.searchResultsOverlay.dataSource.ol.getFeatureById(
          result.meta.id
        );
      if (feature) {
        feature.setStyle(result.data.meta.style);
        return;
      }
      this.map.searchResultsOverlay.addFeature(
        result.data as Feature,
        this.searchState.featureMotion.focus
      );
    }
  }

  onResultUnfocus(result: SearchResult) {
    this.focusedResult$.next(undefined);
    if (result.meta.dataType !== FEATURE) {
      return;
    }

    if (this.store.state.get(result).selected === true) {
      const feature =
        this.map.searchResultsOverlay.dataSource.ol.getFeatureById(
          result.meta.id
        );
      if (feature) {
        const style = getCommonVectorSelectedStyle(
          Object.assign(
            {},
            { feature: result.data as Feature | olFeature<OlGeometry> },
            this.searchState.searchOverlayStyleFocus,
            result.style?.focus ? result.style.focus : {}
          )
        );
        feature.setStyle(style);
      }
      return;
    }
    this.map.searchResultsOverlay.removeFeature(result.data as Feature);
  }

  /**
   * Try to add a feature to the map when it's being selected
   * @internal
   * @param result A search result that could be a feature or some layer options
   */
  onResultSelect(result: SearchResult) {
    this.map.searchResultsOverlay.dataSource.ol.clear();
    this.tryAddFeatureToMap(result, this.searchState.featureMotion.selected);
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
  private tryAddFeatureToMap(
    result: SearchResult,
    motion: FeatureMotion = FeatureMotion.Default
  ) {
    if (result.meta.dataType !== FEATURE) {
      return undefined;
    }
    const feature = (result as SearchResult<Feature>).data;

    // Somethimes features have no geometry. It happens with some GetFeatureInfo
    if (!feature.geometry) {
      return;
    }

    feature.meta.style = getCommonVectorSelectedStyle(
      Object.assign(
        {},
        { feature },
        this.searchState.searchOverlayStyleSelection,
        result.style?.selection ? result.style.selection : {}
      )
    );

    this.map.searchResultsOverlay.addFeature(feature, motion);
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

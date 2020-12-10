import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { Observable, BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import olFormatGeoJSON from 'ol/format/GeoJSON';
import olFeature from 'ol/Feature';
import olPoint from 'ol/geom/Point';

import { ConfigService } from '@igo2/core';

import {
  EntityStore,
  ToolComponent,
  FlexibleState,
  getEntityTitle,
  FlexibleComponent
} from '@igo2/common';

import {
  LayerService,
  FEATURE,
  Feature,
  FeatureMotion,
  SearchResult,
  IgoMap,
  moveToOlFeatures,
  Research,
  createOverlayDefaultStyle,
  featuresAreTooDeepInView,
  featureToOl,
  featureFromOl,
  getSelectedMarkerStyle,
  createOverlayMarkerStyle,
  computeOlFeaturesExtent,
  featuresAreOutOfView
} from '@igo2/geo';

import { MapState } from '../../map/map.state';

import { SearchState } from '../search.state';
import { ToolState } from '../../tool/tool.state';
import { DirectionState } from '../../directions/directions.state';

/**
 * Tool to browse the search results
 */
@ToolComponent({
  name: 'searchResults',
  title: 'igo.integration.tools.searchResults',
  icon: 'magnify'
})
@Component({
  selector: 'igo-search-results-tool',
  templateUrl: './search-results-tool.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultsToolComponent implements OnInit, OnDestroy {
  /**
   * to show hide results icons
   */
  @Input() showIcons: boolean = true;

  private hasFeatureEmphasisOnSelection: boolean = false;

  private focusedOrResolution$$: Subscription;
  private selectedOrResolution$$: Subscription;
  private focusedResult$: BehaviorSubject<SearchResult> = new BehaviorSubject(
    undefined
  );
  public isSelectedResultOutOfView$ = new BehaviorSubject(false);
  private isSelectedResultOutOfView$$: Subscription;
  private abstractFocusedResult: Feature;
  private abstractSelectedResult: Feature;

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

  private format = new olFormatGeoJSON();

  constructor(
    private mapState: MapState,
    private layerService: LayerService,
    private searchState: SearchState,
    private elRef: ElementRef,
    public toolState: ToolState,
    private directionState: DirectionState,
    configService: ConfigService
  ) {
    this.hasFeatureEmphasisOnSelection = configService.getConfig(
      'hasFeatureEmphasisOnSelection'
    );
  }

  ngOnInit() {
    this.searchTerm$$ = this.searchState.searchTerm$.subscribe(
      (searchTerm: string) => {
        if (searchTerm !== undefined && searchTerm !== null) {
          this.term = searchTerm;
        }
      }
    );

    for (const res of this.store.entities$.value) {
      if (this.store.state.get(res).selected === true) {
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
      this.focusedOrResolution$$ = combineLatest([
        this.focusedResult$,
        this.map.viewController.resolution$
      ]).subscribe((bunch: [SearchResult<Feature>, number]) =>
        this.buildResultEmphasis(bunch[0], 'focused')
      );

      this.selectedOrResolution$$ = combineLatest([
        this.searchState.selectedResult$,
        this.map.viewController.resolution$
      ]).subscribe((bunch: [SearchResult<Feature>, number]) =>
        this.buildResultEmphasis(bunch[0], 'selected')
      );
    }
    this.monitorResultOutOfView();
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
          const selectedOlFeatureExtent = computeOlFeaturesExtent(this.map, [
            selectedOlFeature
          ]);
          this.isSelectedResultOutOfView$.next(
            featuresAreOutOfView(this.map, selectedOlFeatureExtent)
          );
        }
      });
  }

  private buildResultEmphasis(
    result: SearchResult<Feature>,
    trigger: 'selected' | 'focused' | undefined
  ) {
    this.clearFeatureEmphasis(trigger);
    if (!result || !result.data.geometry) {
      return;
    }
    const myOlFeature = featureToOl(result.data, this.map.projection);
    const olGeometry = myOlFeature.getGeometry();
    if (result.data.geometry.type !== 'Point') {
      if (featuresAreTooDeepInView(this.map, olGeometry.getExtent(), 0.0025)) {
        const extent = olGeometry.getExtent();
        const x = extent[0] + (extent[2] - extent[0]) / 2;
        const y = extent[1] + (extent[3] - extent[1]) / 2;
        const feature1 = new olFeature({
          name: `${trigger}AbstractResult'`,
          geometry: new olPoint([x, y])
        });
        const abstractResult = featureFromOl(feature1, this.map.projection);
        abstractResult.meta.style =
          trigger === 'focused'
            ? createOverlayMarkerStyle()
            : getSelectedMarkerStyle(abstractResult);
        abstractResult.meta.style.setZIndex(2000);
        this.map.overlay.addFeature(abstractResult, FeatureMotion.None);
        if (trigger === 'focused') {
          this.abstractFocusedResult = abstractResult;
        }
        if (trigger === 'selected') {
          this.abstractSelectedResult = abstractResult;
        }
      } else {
        this.clearFeatureEmphasis(trigger);
      }
    }
  }

  private clearFeatureEmphasis(trigger: 'selected' | 'focused' | undefined) {
    if (trigger === 'focused' && this.abstractFocusedResult) {
      this.map.overlay.removeFeature(this.abstractFocusedResult);
      this.abstractFocusedResult = undefined;
    }
    if (trigger === 'selected' && this.abstractSelectedResult) {
      this.map.overlay.removeFeature(this.abstractSelectedResult);
      this.abstractSelectedResult = undefined;
    }
  }

  ngOnDestroy() {
    this.topPanelState$$.unsubscribe();
    this.searchTerm$$.unsubscribe();
    if (this.selectedOrResolution$$) {
      this.selectedOrResolution$$.unsubscribe();
    }
    if (this.focusedOrResolution$$) {
      this.focusedOrResolution$$.unsubscribe();
    }
    if (this.isSelectedResultOutOfView$$) {
      this.isSelectedResultOutOfView$$.unsubscribe();
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
      if (
        this.map.viewController.getZoom() < 11 &&
        (result.data.geometry.type === 'MultiLineString' ||
          result.data.geometry.type === 'LineString')
      ) {
        result.data.meta.style = createOverlayDefaultStyle({ strokeWidth: 10 });
      } else if (
        this.map.viewController.getZoom() < 11 &&
        (result.data.geometry.type === 'MultiPolygon' ||
          result.data.geometry.type === 'Polygon')
      ) {
        result.data.meta.style = createOverlayDefaultStyle({ strokeWidth: 2 });
      } else if (
        this.map.viewController.getZoom() > 10 &&
        result.data.geometry.type !== 'Point'
      ) {
        result.data.meta.style = createOverlayDefaultStyle();
      }
      this.map.overlay.addFeature(result.data as Feature, FeatureMotion.None);
    }
  }

  onResultUnfocus(result: SearchResult) {
    this.focusedResult$.next(undefined);
    if (result.meta.dataType !== FEATURE) {
      return;
    }

    if (this.store.state.get(result).selected === true) {
      return;
    }
    this.map.overlay.removeFeature(result.data as Feature);
  }

  /**
   * Try to add a feature to the map when it's being selected
   * @internal
   * @param result A search result that could be a feature or some layer options
   */
  onResultSelect(result: SearchResult) {
    this.map.overlay.dataSource.ol.clear();
    this.tryAddFeatureToMap(result);
    this.searchState.setSelectedResult(result);

    if (this.topPanelState === 'expanded') {
      const igoList = this.computeElementRef()[0];
      const selected = this.computeElementRef()[1];
      setTimeout(() => {
        // To be sure the flexible component has been displayed yet
        if (!this.isScrolledIntoView(igoList, selected)) {
          this.adjustTopPanel(igoList, selected);
        }
      }, FlexibleComponent.transitionTime + 50);
    }

    if (this.topPanelState === 'initial') {
      this.topPanelState = 'expanded';
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
          moreResults = igoList.querySelector('.' + source[0].source.getId() + ' .moreResults');
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
    const igoList = this.elRef.nativeElement.getElementsByTagName(
      'igo-list'
    )[0];
    let selectedItem;
    // tslint:disable-next-line
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

  toggleTopPanel() {
    if (this.topPanelState === 'expanded') {
      this.topPanelState = 'collapsed';
    } else {
      this.topPanelState = 'expanded';
    }
  }

  zoomToFeatureExtent() {
    if (this.feature.geometry) {
      const localOlFeature = this.format.readFeature(this.feature, {
        dataProjection: this.feature.projection,
        featureProjection: this.map.projection
      });
      moveToOlFeatures(this.map, [localOlFeature], FeatureMotion.Zoom);
    }
  }

  /**
   * Try to add a feature to the map overlay
   * @param result A search result that could be a feature
   */
  private tryAddFeatureToMap(result: SearchResult) {
    if (result.meta.dataType !== FEATURE) {
      return undefined;
    }
    const feature = (result as SearchResult<Feature>).data;

    // Somethimes features have no geometry. It happens with some GetFeatureInfo
    if (!feature.geometry) {
      return;
    }

    if (feature.geometry.type !== 'Point') {
      feature.meta.style = createOverlayDefaultStyle();
    }

    this.map.overlay.addFeature(feature);
  }

  isScrolledIntoView(elemSource, elem) {
    const padding = 6;
    const docViewTop = elemSource.scrollTop;
    const docViewBottom = docViewTop + elemSource.clientHeight;

    const elemTop = elem.offsetTop;
    const elemBottom = elemTop + elem.clientHeight + padding;
    return elemBottom <= docViewBottom && elemTop >= docViewTop;
  }

  getRoute(features: Feature[]) {
    this.toolState.toolbox.activateTool('directions');
    this.directionState.stopsStore.clear();
    this.directionState.setRouteFromFeatureDetail(true);
    this.directionState.stopsStore.insertMany(features);
  }
}

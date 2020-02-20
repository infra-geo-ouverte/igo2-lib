import { Component, ChangeDetectionStrategy, Input, OnInit, ElementRef } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import olFormatGeoJSON from 'ol/format/GeoJSON';

import {
  EntityStore,
  ToolComponent,
  FlexibleState,
  getEntityTitle,
  FlexibleComponent
} from '@igo2/common';

import {
  LayerService,
  LayerOptions,
  FEATURE,
  Feature,
  FeatureMotion,
  LAYER,
  SearchResult,
  IgoMap,
  moveToOlFeatures,
  Research,
  createOverlayDefaultStyle
} from '@igo2/geo';

import { MapState } from '../../map/map.state';

import { SearchState } from '../search.state';

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
export class SearchResultsToolComponent implements OnInit {
  /**
   * to show hide results icons
   */
  @Input() showIcons: boolean = true;

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
      .firstBy$(e => e.state.focused)
      .pipe(
        map(
          element =>
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
  ) {}

  ngOnInit() {
    this.searchTerm$$ = this.searchState.searchTerm$.subscribe((searchTerm: string) => {
      if (searchTerm !== undefined && searchTerm !== null) {
        this.term = searchTerm;
      }
    });

    for (const res of this.store.entities$.value) {
      if (this.store.state.get(res).selected === true) {
        this.topPanelState = 'collapsed';
      }
    }

    this.searchState.searchSettingsChange$.subscribe(() => {
      this.settingsChange$.next(true);
    });
  }
  /**
   * Try to add a feature to the map when it's being focused
   * @internal
   * @param result A search result that could be a feature
   */
  onResultFocus(result: SearchResult) {
    if (result.meta.dataType === FEATURE) {
      if (this.map.viewController.getZoom() < 11 && (result.data.geometry.type === 'MultiLineString' || result.data.geometry.type === 'LineString')) {
        result.data.meta.style = createOverlayDefaultStyle({strokeWidth: 10});
      } else if (this.map.viewController.getZoom() < 11 && (result.data.geometry.type === 'MultiPolygon' || result.data.geometry.type === 'Polygon')) {
        result.data.meta.style = createOverlayDefaultStyle({strokeWidth: 2});
      } else if (this.map.viewController.getZoom() > 10 && result.data.geometry.type !== 'Point') {
        result.data.meta.style = createOverlayDefaultStyle();
      }
      this.map.overlay.addFeature(result.data as Feature, FeatureMotion.None);
    }
  }

  onResultUnfocus(result: SearchResult) {
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
    for (const feature of this.store.all()) {
      if (this.map.overlay.dataSource.ol.getFeatureById(feature.meta.id)) {
        this.map.overlay.removeFeature(feature.data as Feature);
      }
    }
    this.tryAddFeatureToMap(result);
    if (this.topPanelState === 'initial') {
      this.toggleTopPanel();
    }
  }

  onSearch(event: { research: Research; results: SearchResult[] }) {
    const results = event.results;
    this.store.state.updateAll({ focused: false, selected: false });
    const newResults = this.store.entities$.value
      .filter((result: SearchResult) => result.source !== event.research.source)
      .concat(results);
    this.store.load(newResults);
  }

  toggleTopPanel() {
    if (this.topPanelState === 'expanded') {
      this.topPanelState = 'collapsed';
    } else {
      this.topPanelState = 'expanded';

      const items = document.getElementsByTagName('igo-search-results-item');
      const igoList = this.elRef.nativeElement.getElementsByTagName('igo-list')[0];
      let selectedItem;
      // tslint:disable-next-line
      for (let i = 0; i < items.length; i++) {
        if (items[i].className === 'ng-star-inserted igo-list-item-selected') {
          selectedItem = items[i];
        }
      }

      setTimeout(() => { // To be sure the flexible component has been displayed yet
        if (!this.isScrolledIntoView(igoList, selectedItem)) {
          igoList.scrollTop = selectedItem.offsetTop + selectedItem.children[0].offsetHeight - igoList.clientHeight;
        }
      }, FlexibleComponent.transitionTime + 100);
    }
  }

  zoomToFeatureExtent() {
    if (this.feature.geometry) {
      const olFeature = this.format.readFeature(this.feature, {
        dataProjection: this.feature.projection,
        featureProjection: this.map.projection
      });
      moveToOlFeatures(this.map, [olFeature], FeatureMotion.Zoom);
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
    if (feature.geometry.type !== 'Point') {
      feature.meta.style = createOverlayDefaultStyle();
    }

    // Somethimes features have no geometry. It happens with some GetFeatureInfo
    if (feature.geometry === undefined) {
      return;
    }

    this.map.overlay.addFeature(feature);
  }

  /**
   * Try to add a layer to the map
   * @param result A search result that could be some layer options
   */
  private tryAddLayerToMap(result: SearchResult) {
    if (this.map === undefined) {
      return;
    }

    if (result.meta.dataType !== LAYER) {
      return undefined;
    }
    const layerOptions = (result as SearchResult<LayerOptions>).data;
    this.layerService
      .createAsyncLayer(layerOptions)
      .subscribe(layer => this.map.addLayer(layer));
  }

  isScrolledIntoView(elemSource, elem) {
    const padding = 6;
    const docViewTop = elemSource.scrollTop;
    const docViewBottom = docViewTop + elemSource.clientHeight;

    const elemTop = elem.offsetTop;
    const elemBottom = elemTop + elem.clientHeight + padding;
    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
  }
}

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import olFormatGeoJSON from 'ol/format/GeoJSON';

import {
  EntityStore,
  ToolComponent,
  FlexibleState,
  getEntityTitle
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
  moveToOlFeatures
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
export class SearchResultsToolComponent {
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
    private searchState: SearchState
  ) {}

  /**
   * Try to add a feature to the map when it's being focused
   * @internal
   * @param result A search result that could be a feature
   */
  onResultFocus(result: SearchResult) {
    this.tryAddFeatureToMap(result);
    if (this.topPanelState === 'initial') {
      this.toggleTopPanel();
    }
  }

  /**
   * Try to add a feature to the map when it's being selected
   * @internal
   * @param result A search result that could be a feature or some layer options
   */
  onResultSelect(result: SearchResult) {
    this.tryAddFeatureToMap(result);
    this.tryAddLayerToMap(result);
    if (this.topPanelState === 'initial') {
      this.toggleTopPanel();
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

    // Somethimes features have no geometry. It happens with some GetFeatureInfo
    if (feature.geometry === undefined) {
      return;
    }

    this.map.overlay.setFeatures([feature], FeatureMotion.Default);
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
}

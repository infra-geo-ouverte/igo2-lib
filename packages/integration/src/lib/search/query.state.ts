import { Injectable, inject } from '@angular/core';

import { EntityStore } from '@igo2/common/entity';
import {
  CapabilitiesService,
  GeoPropertiesStrategy,
  LayerQueryResultsOlStyleFunction,
  Overlay,
  PropertyTypeDetectorService,
  SearchResult
} from '@igo2/geo';

import { MapState } from '../map/map.state';

/**
 * Service that holds the state of the query module
 */
@Injectable({
  providedIn: 'root'
})
export class QueryState {
  private propertyTypeDetectorService = inject(PropertyTypeDetectorService);
  private capabilitiesService = inject(CapabilitiesService);
  private mapState = inject(MapState);

  /**
   * Store that holds the query results
   */
  public store = new EntityStore<SearchResult>([]);
  public queryResultsOverlayFocused: Overlay;
  public queryResultsOverlaySelected: Overlay;
  public queryResultsOverlayAll: Overlay;

  constructor() {
    const geoPropertiesStrategy = new GeoPropertiesStrategy(
      { map: this.mapState.map },
      this.propertyTypeDetectorService,
      this.capabilitiesService
    );
    this.store.addStrategy(geoPropertiesStrategy, true);

    this.queryResultsOverlayFocused = new Overlay(this.mapState.map);
    this.queryResultsOverlayFocused.setLayerOlStyle(
      LayerQueryResultsOlStyleFunction(this.mapState.map, 'focus')
    );
    this.queryResultsOverlaySelected = new Overlay(this.mapState.map);
    this.queryResultsOverlaySelected.setLayerOlStyle(
      LayerQueryResultsOlStyleFunction(this.mapState.map, 'selection')
    );
    this.queryResultsOverlayAll = new Overlay(this.mapState.map);
    this.queryResultsOverlayAll.setLayerOlStyle(
      LayerQueryResultsOlStyleFunction(this.mapState.map)
    );
  }
}

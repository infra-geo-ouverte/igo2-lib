import { Injectable } from '@angular/core';

import { EntityStore } from '@igo2/common';
import { ConfigService } from '@igo2/core';
import {
  CapabilitiesService,
  CommonVectorStyleOptions,
  GeoPropertiesStrategy,
  OverlayStyleOptions,
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
  /**
   * Store that holds the query results
   */
  public store = new EntityStore<SearchResult>([]);
  public queryOverlayStyle: CommonVectorStyleOptions = {};
  public queryOverlayStyleSelection: CommonVectorStyleOptions = {};
  public queryOverlayStyleFocus: CommonVectorStyleOptions = {};

  constructor(
    private configService: ConfigService,
    private propertyTypeDetectorService: PropertyTypeDetectorService,
    private capabilitiesService: CapabilitiesService,
    private mapState: MapState
  ) {
    const queryOverlayStyle: OverlayStyleOptions =
      this.configService.getConfig('queryOverlayStyle');
    if (queryOverlayStyle) {
      this.queryOverlayStyle = queryOverlayStyle.base;
      this.queryOverlayStyleSelection = queryOverlayStyle.selection;
      this.queryOverlayStyleFocus = queryOverlayStyle.focus;
    }
    const geoPropertiesStrategy = new GeoPropertiesStrategy(
      { map: this.mapState.map },
      this.propertyTypeDetectorService,
      this.capabilitiesService
    );
    this.store.addStrategy(geoPropertiesStrategy, true);
  }
}

import { Injectable, inject } from '@angular/core';

import { EntityStore } from '@igo2/common/entity';
import { ConfigService } from '@igo2/core/config';
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
  private configService = inject(ConfigService);
  private propertyTypeDetectorService = inject(PropertyTypeDetectorService);
  private capabilitiesService = inject(CapabilitiesService);
  private mapState = inject(MapState);

  /**
   * Store that holds the query results
   */
  public store = new EntityStore<SearchResult>([]);
  public queryOverlayStyle: CommonVectorStyleOptions = {};
  public queryOverlayStyleSelection: CommonVectorStyleOptions = {};
  public queryOverlayStyleFocus: CommonVectorStyleOptions = {};

  constructor() {
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

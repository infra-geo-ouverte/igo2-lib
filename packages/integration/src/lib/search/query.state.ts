import { Injectable, inject } from '@angular/core';

import { EntityStore } from '@igo2/common/entity';
import { ConfigService } from '@igo2/core/config';
import {
  CapabilitiesService,
  ConfigurableStylesOptions,
  GeoPropertiesStrategy,
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
  private configService = inject(ConfigService);
  private mapState = inject(MapState);

  /**
   * Store that holds the query results
   */
  public store = new EntityStore<SearchResult>([]);
  public queryOverlayStyle: ConfigurableStylesOptions = {};

  constructor() {
    this.queryOverlayStyle = this.configService.getConfig(
      'queryOverlayStyle',
      {}
    );

    const geoPropertiesStrategy = new GeoPropertiesStrategy(
      { map: this.mapState.map },
      this.propertyTypeDetectorService,
      this.capabilitiesService
    );
    this.store.addStrategy(geoPropertiesStrategy, true);
  }
}

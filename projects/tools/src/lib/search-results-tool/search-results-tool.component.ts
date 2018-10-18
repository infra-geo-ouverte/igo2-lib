import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

import {
  MapService,
  LayerService,
  OverlayService,
  OverlayAction,
  Feature,
  FeatureType
} from '@igo2/geo';
import { SearchResultsToolOptions } from './search-results-tool.interface';

@Register({
  name: 'searchResults',
  title: 'igo.tools.searchResults',
  icon: 'search'
})
@Component({
  selector: 'igo-search-results-tool',
  templateUrl: './search-results-tool.component.html'
})
export class SearchResultsToolComponent {
  public options: SearchResultsToolOptions = {};

  get focusFirst(): boolean {
    return this.options.focusFirst === undefined
      ? true
      : this.options.focusFirst;
  }

  constructor(
    private overlayService: OverlayService,
    private mapService: MapService,
    private layerService: LayerService
  ) {}

  handleFeatureFocus(feature: Feature) {
    if (feature.type === FeatureType.Feature) {
      this.overlayService.setFeatures([feature], OverlayAction.ZoomIfOutMapExtent);
    }
  }

  handleFeatureSelect(feature: Feature) {
    if (feature.type === FeatureType.Feature) {
      this.overlayService.setFeatures([feature], OverlayAction.ZoomIfOutMapExtent);
    } else if (feature.type === FeatureType.DataSource) {
      const map = this.mapService.getMap();
      if (map !== undefined) {
        this.layerService
          .createAsyncLayer(feature.layer)
          .subscribe(layer => {
            map.addLayer(layer);
          });
      }
    }
  }
}

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

import {
  MapService,
  LayerService,
  OverlayService,
  OverlayAction,
  Feature,
  FeatureType,
  AnyDataSourceOptions,
  DataSourceService
} from '@igo2/geo';

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
  constructor(
    private overlayService: OverlayService,
    private mapService: MapService,
    private layerService: LayerService,
    private dataSourceService: DataSourceService
  ) {}

  handleFeatureFocus(feature: Feature) {
    if (feature.type === FeatureType.Feature) {
      this.overlayService.setFeatures([feature], OverlayAction.Move);
    }
  }

  handleFeatureSelect(feature: Feature) {
    if (feature.type === FeatureType.Feature) {
      this.overlayService.setFeatures([feature], OverlayAction.ZoomIfOutMapExtent);
    } else if (feature.type === FeatureType.DataSource) {
      const map = this.mapService.getMap();

      if (map !== undefined) {
        this.dataSourceService
          .createAsyncDataSource(feature.layer as AnyDataSourceOptions)
          .subscribe(dataSource => {
            (feature.layer as any).source = dataSource;
            map.addLayer(this.layerService.createLayer(feature.layer));
          });
      }
    }
  }
}

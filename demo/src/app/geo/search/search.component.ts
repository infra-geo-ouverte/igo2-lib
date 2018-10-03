import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  LayerService,
  MapService,
  Layer,
  SearchService,
  Feature,
  FeatureType,
  OverlayAction,
  OverlayService
} from '@igo2/geo';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class AppSearchComponent {
  public map = new IgoMap({
    overlay: true,
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 7
  };

  public osmLayer: Layer;

  constructor(
    private mapService: MapService,
    private languageService: LanguageService,
    private layerService: LayerService,
    private searchService: SearchService,
    private overlayService: OverlayService
  ) {
    this.mapService.setMap(this.map);

    this.layerService
      .createAsyncLayer({
        title: 'OSM',
        sourceOptions: {
          type: 'osm'
        }
      })
      .subscribe(layer => {
        this.osmLayer = layer;
        this.map.addLayer(layer);
      });

    this.clearFeature();
  }

  resetMap() {
    this.map.removeLayers();
    this.map.addLayer(this.osmLayer);
    this.clearFeature();
  }

  clearFeature() {
    this.overlayService.clear();
  }

  handleFeatureSelect(feature: Feature) {
    if (feature.type === FeatureType.Feature) {
      this.overlayService.setFeatures([feature], OverlayAction.ZoomIfOutMapExtent);
    } else if (feature.type === FeatureType.DataSource) {
      this.layerService.createAsyncLayer(feature.layer).subscribe(layer => {
        this.map.addLayer(layer);
      });
    }
  }
}

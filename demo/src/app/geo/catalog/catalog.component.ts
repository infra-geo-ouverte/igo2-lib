import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import { IgoMap, LayerService, Catalog, MapService, Layer } from '@igo2/geo';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class AppCatalogComponent {
  public map = new IgoMap({
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

  public catalogSelected: Catalog;
  public osmLayer: Layer;

  constructor(
    private mapService: MapService,
    private languageService: LanguageService,
    private layerService: LayerService
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
  }

  selectCatalog(catalog) {
    this.catalogSelected = catalog;
  }

  unselectCatalog() {
    this.catalogSelected = undefined;
  }

  resetMap() {
    this.map.removeLayers();
    this.map.addLayer(this.osmLayer);
  }
}

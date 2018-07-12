import { Component } from '@angular/core';

import * as ol from 'openlayers';

import { LanguageService } from '@igo2/core';
import {
  IgoMap,
  OSMDataSource,
  TileLayer,
  DataSourceService,
  LayerService
} from '@igo2/geo';

@Component({
  selector: 'app-geo',
  templateUrl: './geo.component.html',
  styleUrls: ['./geo.component.scss']
})
export class AppGeoComponent {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 6
  };

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm',
        title: 'OSM'
      })
      .subscribe(dataSource => {
        this.map.addLayer(this.layerService.createLayer(dataSource, {}));
      });
    // const osmDS = new OSMDataSource({
    //   title: 'OSM'
    // });

    // const osmLayer = new TileLayer(osmDS);
    // osmLayer.add(this.map);

    // this.map.ol.addLayer(
    //   new ol.layer.Tile({
    //     source: new ol.source.OSM()
    //   })
    // );
  }
}

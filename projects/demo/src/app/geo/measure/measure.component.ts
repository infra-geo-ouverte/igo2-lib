import { Component } from '@angular/core';

import {
  DataSourceService,
  FeatureStore,
  FeatureWithMeasure,
  IgoMap,
  LayerOptions,
  LayerService,
  MapViewOptions,
  OSMDataSource,
  OSMDataSourceOptions
} from '@igo2/geo';

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.scss']
})
export class AppMeasureComponent {
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      },
      scaleLine: true
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 6,
    projection: 'EPSG:3857'
  };

  public store: FeatureStore = new FeatureStore<FeatureWithMeasure>([], { map: this.map });

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      } as OSMDataSourceOptions)
      .subscribe((dataSource: OSMDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            baseLayer: true,
            visible: true
          } as LayerOptions)
        );
      });
  }
}

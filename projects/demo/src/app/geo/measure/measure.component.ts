import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  DataSourceService,
  FeatureStore,
  FeatureWithMeasure,
  IgoMap,
  LayerService,
  MapBrowserComponent,
  MeasurerComponent,
  ZoomButtonComponent
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-measure',
  templateUrl: './measure.component.html',
  styleUrls: ['./measure.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MapBrowserComponent,
    ZoomButtonComponent,
    MeasurerComponent
  ]
})
export class AppMeasureComponent {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      },
      scaleLine: true
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 6,
    projection: 'EPSG:3857'
  };

  public store = new FeatureStore<FeatureWithMeasure>([], { map: this.map });

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      })
      .subscribe((dataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource
          })
        );
      });
  }
}

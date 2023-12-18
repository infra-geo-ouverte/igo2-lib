import { Component } from '@angular/core';

import { LanguageService } from '@igo2/core';
import {
  DataSourceService,
  FeatureStore,
  FeatureWithDraw,
  IgoMap,
  LayerService,
  MapService
} from '@igo2/geo';

import { IgoDrawModule } from '../../../../../../packages/geo/src/lib/draw/draw/draw.module';
import { IgoMapModule } from '../../../../../../packages/geo/src/lib/map/map.module';
import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    IgoMapModule,
    IgoDrawModule
  ]
})
export class AppDrawComponent {
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

  public stores: FeatureStore<FeatureWithDraw>[] = [];

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private mapService: MapService
  ) {
    this.mapService.setMap(this.map);
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

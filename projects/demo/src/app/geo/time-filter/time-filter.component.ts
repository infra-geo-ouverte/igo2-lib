import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { IgoPanelModule } from '@igo2/common';
import {
  DataSourceService,
  IgoFilterModule,
  IgoMap,
  IgoMapModule,
  LayerOptions,
  LayerService,
  MapViewOptions,
  OSMDataSource,
  OSMDataSourceOptions,
  TimeFilterStyle,
  TimeFilterType,
  TimeFilterableDataSource,
  TimeFilterableDataSourceOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-time-filter',
  templateUrl: './time-filter.component.html',
  styleUrls: ['./time-filter.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatGridListModule,
    IgoMapModule,
    IgoPanelModule,
    IgoFilterModule
  ]
})
export class AppTimeFilterComponent {
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 7
  };

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      } satisfies OSMDataSourceOptions)
      .subscribe((dataSource: OSMDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            baseLayer: true,
            visible: true,
            source: dataSource
          } satisfies LayerOptions)
        );
      });

    const datasourceYear: TimeFilterableDataSourceOptions = {
      type: 'wms',
      url: 'https://geoegl.msp.gouv.qc.ca/ws/igo_gouvouvert.fcgi',
      params: {
        LAYERS: 'vg_observation_v_inondation_embacle_wmst',
        VERSION: '1.3.0'
      },
      timeFilterable: true,
      timeFilter: {
        min: '2013',
        max: '2019',
        range: false,
        type: TimeFilterType.YEAR,
        style: TimeFilterStyle.SLIDER,
        step: 1
      }
    };

    this.dataSourceService
      .createAsyncDataSource(datasourceYear)
      .subscribe((dataSource: TimeFilterableDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'Embâcles',
            source: dataSource
          } satisfies LayerOptions)
        );
      });
  }
}

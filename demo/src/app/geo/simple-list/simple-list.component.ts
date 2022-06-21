import OlFeature from 'ol/Feature';
import { Component, OnInit } from '@angular/core';
import { DataSourceService, VectorLayer, IgoMap, LayerService, WFSDataSourceOptions } from '@igo2/geo';
import { Geometry } from 'ol/geom';


@Component({
  selector: 'app-simple-list',
  templateUrl: './simple-list.component.html',
  styleUrls: ['./simple-list.component.scss']
})
export class AppSimpleListComponent implements OnInit {

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

  public features: Array<OlFeature<Geometry>>;

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService) { }

  ngOnInit(): void {
    this.dataSourceService.createAsyncDataSource({type: 'osm'}).subscribe(dataSource => {
      this.map.addLayer(this.layerService.createLayer({
        title: 'OSM',
        source: dataSource
      }));
    });

    const wfsDataSourceOptions: WFSDataSourceOptions = {
      type: "wfs",
      url: "https://geoegl.msp.gouv.qc.ca/apis/wss/all.fcgi",
      params: {
        featureTypes: "MSP_DIRECTION_REG_COG_P_V",
        fieldNameGeometry: "geometry",
        outputFormat: undefined
      }
    };

    this.dataSourceService.createAsyncDataSource(wfsDataSourceOptions).subscribe(dataSource => {
      const layer = this.layerService.createLayer({
        title: "Simple WFS",
        id: "Simple WFS",
        source: dataSource
      }) as VectorLayer;
      this.map.addLayer(layer);
    });
  }
}

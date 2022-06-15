import { Component, OnInit } from '@angular/core';
import { DataSourceService, FeatureStore, IgoMap, LayerService, WFSDataSourceOptions } from '@igo2/geo';
import { WorkspaceState } from '@igo2/integration';


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

  public store = new FeatureStore([], { map: this.map });

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    public workspaceState: WorkspaceState) { }

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
      const layer = {
        title: "Simple WFS",
        source: dataSource
      };
      this.map.addLayer(this.layerService.createLayer(layer));
    });
  }
}

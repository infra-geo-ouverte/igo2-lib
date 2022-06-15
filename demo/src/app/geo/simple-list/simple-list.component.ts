import { Component, OnInit } from '@angular/core';
import { Workspace } from '@igo2/common';
import { DataSourceService, FeatureStore, IgoMap, LayerService, WFSDataSourceOptions } from '@igo2/geo';
import { WorkspaceState } from '@igo2/integration';
import { Observable } from 'rxjs';

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

  public selectedWorkspace$: Observable<Workspace>;

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private workspaceState: WorkspaceState) { }

  ngOnInit(): void {
    this.dataSourceService.createAsyncDataSource({type: 'osm'}).subscribe(dataSource => {
      this.map.addLayer(this.layerService.createLayer({
        title: 'OSM',
        source: dataSource
      }));
    });

    const wfsDataSourceOptions: WFSDataSourceOptions = {
      type: "wfs",
      urlWfs: "https://geoegl.msp.gouv.qc.ca/apis/wss/all.fcgi",
      params: {
        featureTypes: "MSP_DIRECTION_REG_COG_P_V",
        fieldNameGeometry: "geometry",
        outputFormat: "geojson"
      },
    };

    this.dataSourceService.createAsyncDataSource(wfsDataSourceOptions).subscribe(dataSource => {
      const layer = {
        title: "Simple WFS ",
        source: dataSource
      };
      this.map.addLayer(this.layerService.createLayer(layer));
      console.log(this.workspaceState);
    });
  }
}

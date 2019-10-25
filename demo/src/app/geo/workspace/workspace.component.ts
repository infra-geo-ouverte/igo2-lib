import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import {
  ActionbarMode,
  EntityRecord,
  EntityTableScrollBehavior,
  Workspace,
  WorkspaceStore
} from '@igo2/common';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  WFSDataSourceOptions
} from '@igo2/geo';
import { OgcFilterableDataSourceOptions } from 'packages/geo/src/public_api';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class AppWorkspaceComponent implements OnInit {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-72, 47.2],
    zoom: 5
  };

  public workspaceStore = new WorkspaceStore([]);

  public selectedWorkspace$: Observable<Workspace>;

  public actionbarMode = ActionbarMode.Dock;

  public scrollBehavior = EntityTableScrollBehavior.Instant;

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {}

  ngOnInit() {
    this.selectedWorkspace$ = this.workspaceStore.stateView
      .firstBy$(
        (record: EntityRecord<Workspace>) => record.state.selected === true
      )
      .pipe(
        map((record: EntityRecord<Workspace>) => {
          return record === undefined ? undefined : record.entity;
        })
      );

    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      })
      .subscribe(dataSource => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource
          })
        );
      });

    // const wmsDataSourceOptions = {
    //   type: 'wms',
    //   url: 'https://ahocevar.com/geoserver/wms',
    //   urlWfs: 'https://ahocevar.com/geoserver/wfs',
    //   params: {
    //     layers: 'water_areas',
    //     version: '1.3.0'
    //   },
    //   paramsWFS: {
    //     featureTypes: 'water_areas',
    //     fieldNameGeometry: 'the_geom',
    //     maxFeatures: 10000,
    //     version: '1.1.0',
    //     outputFormat: 'application/json',
    //     outputFormatDownload: 'application/vnd.google-earth.kml+xml'
    //   },
    //   sourceFields: [
    //     {name: 'waterway', alias: 'Chemin d eau'},
    //     {name: 'osm_id'},
    //     {name: 'landuse'}
    //   ],
    //   ogcFilters: {
    //     enabled: true,
    //     editable: true
    //   },
    //   serverType: 'geoserver'
    // };
    //
    // this.dataSourceService
    //   .createAsyncDataSource(wmsDataSourceOptions as OgcFilterableDataSourceOptions)
    //   .subscribe(dataSource => {
    //     const layer = {
    //       optionsFromCapabilities: true,
    //       title: 'WMS Geoserver filterable ',
    //       visible: true,
    //       source: dataSource
    //     };
    //     this.map.addLayer(this.layerService.createLayer(layer));
    //   });

    const wfsDataSourceOptions: WFSDataSourceOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/swtq',
      params: {
        featureTypes: 'etablissement_mtq',
        fieldNameGeometry: 'geometry',
        version: '2.0.0',
        outputFormat: 'geojson'
      },
      sourceFields: [
        { name: 'idetablis', alias: 'ID' },
        { name: 'nometablis', alias: 'Name' },
        { name: 'typetablis', alias: 'Type' }
      ]
    };

    this.dataSourceService
      .createAsyncDataSource(wfsDataSourceOptions)
      .subscribe(dataSource => {
        const layer = {
          title: 'Simple WFS ',
          visible: true,
          source: dataSource
        };
        this.map.addLayer(this.layerService.createLayer(layer));
      });
  }
}

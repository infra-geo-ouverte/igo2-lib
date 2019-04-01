import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import {
  ActionbarMode,
  EntityRecord,
  EntityStore,
  EntityTableScrollBehavior,
  Editor
} from '@igo2/common';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  LayerOptions,
  WFSDataSourceOptions
} from '@igo2/geo';

@Component({
  selector: 'app-wfs-browser',
  templateUrl: './wfs-browser.component.html',
  styleUrls: ['./wfs-browser.component.scss']
})
export class AppWfsBrowserComponent implements OnInit {

  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-0, 47.2],
    zoom: 5
  };

  public editorStore = new EntityStore<Editor>([]);

  public activeEditor$: Observable<Editor>;

  public actionbarMode = ActionbarMode.Dock;

  public scrollBehavior = EntityTableScrollBehavior.Instant;

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {}

  ngOnInit() {
    this.activeEditor$ = this.editorStore.stateView
      .firstBy$((record: EntityRecord<Editor>) => record.state.selected === true)
      .pipe(
        map((record: EntityRecord<Editor>) => {
          console.log(record);
          return record ? record.entity : undefined;
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

    const wfsDatasource: WFSDataSourceOptions = {
      type: 'wfs',
      url: 'https://ahocevar.com/geoserver/wfs',
      params: {
        featureTypes: 'ne:ne_10m_admin_0_countries',
        fieldNameGeometry: 'the_geom',
        version: '1.1.0',
        outputFormat: 'application/json'
      },
      sourceFields: [
        {name: 'name', alias: 'Name'},
        {name: 'type', alias: 'Type'}
      ]
    };

    this.dataSourceService
      .createAsyncDataSource(wfsDatasource)
      .subscribe(dataSource => {
        const layer: LayerOptions = {
          title: 'WFS ',
          visible: true,
          source: dataSource
        };
        this.map.addLayer(this.layerService.createLayer(layer));
      });
  }

}

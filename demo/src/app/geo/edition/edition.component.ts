import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import {
  ActionbarMode,
  EntityRecord,
  EntityTableScrollBehavior,
  Editor,
  EditorStore
} from '@igo2/common';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  LayerOptions,
  WFSDataSourceOptions
} from '@igo2/geo';

@Component({
  selector: 'app-edition',
  templateUrl: './edition.component.html',
  styleUrls: ['./edition.component.scss']
})
export class AppEditionComponent implements OnInit {

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

  public editorStore = new EditorStore([]);

  public selectedEditor$: Observable<Editor>;

  public actionbarMode = ActionbarMode.Dock;

  public scrollBehavior = EntityTableScrollBehavior.Instant;

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService
  ) {}

  ngOnInit() {
    this.selectedEditor$ = this.editorStore.stateView
      .firstBy$((record: EntityRecord<Editor>) => record.state.selected === true)
      .pipe(
        map((record: EntityRecord<Editor>) => {
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

    const wfsDatasource: WFSDataSourceOptions = {
      type: 'wfs',
      url: 'https://geoegl.msp.gouv.qc.ca/apis/ws/swtq',
      params: {
        featureTypes: 'etablissement_mtq',
        fieldNameGeometry: 'geometry',
        version: '2.0.0',
        outputFormat: 'geojson'
      },
      sourceFields: [
        {name: 'idetablis', alias: 'ID'},
        {name: 'nometablis', alias: 'Name'},
        {name: 'typetablis', alias: 'Type'}
      ]
    };

    this.dataSourceService
      .createAsyncDataSource(wfsDatasource)
      .subscribe(dataSource => {
        const layer: LayerOptions = {
          title: 'Simple WFS ',
          visible: true,
          source: dataSource
        };
        this.map.addLayer(this.layerService.createLayer(layer));
      });
  }

}

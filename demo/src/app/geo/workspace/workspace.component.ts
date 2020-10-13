import { Component, OnInit } from '@angular/core';

import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { LanguageService } from '@igo2/core';
import {
  ActionbarMode,
  EntityRecord,
  EntityTableScrollBehavior,
  Workspace,
  WorkspaceStore,
  EntityTablePaginatorOptions
} from '@igo2/common';
import {
  IgoMap,
  DataSourceService,
  LayerService,
  WFSDataSourceOptions
} from '@igo2/geo';
import { MatPaginator } from '@angular/material/paginator';
import { WorkspaceState } from '@igo2/integration';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss']
})
export class AppWorkspaceComponent implements OnInit {

  public workspacePaginator: MatPaginator;
  entitySortChange$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public paginatorOptions: EntityTablePaginatorOptions = {
    pageSize: 5, // Number of items to display on a page.
    pageSizeOptions: [1, 5, 10, 15, 30, 50, 100], // The set of provided page size options to display to the user.
    showFirstLastButtons: true // Whether to show the first/last buttons UI to the user.
  };

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

  get workspaceStore(): WorkspaceStore {
    return this.workspaceState.store;
  }

  public selectedWorkspace$: Observable<Workspace>;

  public actionbarMode = ActionbarMode.Overlay;

  public scrollBehavior = EntityTableScrollBehavior.Instant;

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    public workspaceState: WorkspaceState,
  ) {}

  ngOnInit() {
    this.selectedWorkspace$ = this.workspaceStore.stateView
      .firstBy$(
        (record: EntityRecord<Workspace>) => record.state.selected === true
      )
      .pipe(
        map((record: EntityRecord<Workspace>) => {
          const entity = record === undefined ? undefined : record.entity;
          if (entity) {
            // In fact, the download action is not fully functionnal into the igo2-lib demo
            // The reason why it's has been remove is that this button trigger a tool (importExport)
            // and this tool is not available in the igo2-lib demo.
            // This is why it's has been removed frome the actions's list.
            // Refer to the igo2 demo at https://infra-geo-ouverte.github.io/igo2/
            entity.actionStore.view.filter((action) => {
              return action.id !== 'wfsDownload';
            });
          }
          return entity;

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
    //     LAYERS: 'water_areas',
    //     VERSION: '1.3.0'
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

  paginatorChange(event: MatPaginator) {
    this.workspacePaginator = event;
  }
}

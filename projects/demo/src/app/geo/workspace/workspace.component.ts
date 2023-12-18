import { Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';

import {
  Action,
  ActionbarMode,
  EntityRecord,
  EntityTablePaginatorOptions,
  EntityTableScrollBehavior,
  Workspace,
  WorkspaceStore
} from '@igo2/common';
import {
  DataSourceService,
  IgoMap,
  LayerOptions,
  LayerService,
  MapViewOptions,
  OSMDataSource,
  OSMDataSourceOptions,
  VectorLayerOptions,
  WFSDataSource,
  WFSDataSourceOptions
} from '@igo2/geo';
import { WorkspaceState } from '@igo2/integration';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
    center: [-72, 47.2],
    zoom: 5
  };

  get workspaceStore(): WorkspaceStore {
    return this.workspaceState.store;
  }

  public selectedWorkspace$: Observable<Workspace>;

  public actionbarMode: ActionbarMode = ActionbarMode.Overlay;

  public scrollBehavior: EntityTableScrollBehavior = EntityTableScrollBehavior.Instant;

  constructor(
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    public workspaceState: WorkspaceState
  ) {}

  ngOnInit(): void {
    this.selectedWorkspace$ = this.workspaceStore.stateView
      .firstBy$(
        (record: EntityRecord<Workspace>) => record.state.selected === true
      )
      .pipe(
        map((record: EntityRecord<Workspace>) => {
          const entity: Workspace = record === undefined ? undefined : record.entity;
          if (entity) {
            // In fact, the download action is not fully functionnal into the igo2-lib demo
            // The button triggers a tool (importExport) and this tool is not available in the igo2-lib demo.
            // This is why it has been removed from the actions list.
            // Refer to the igo2 demo at https://infra-geo-ouverte.github.io/igo2/
            entity.actionStore.view.filter((action: Action) => {
              return action.id !== 'wfsDownload';
            });
          }
          return entity;
        })
      );

    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      } satisfies OSMDataSourceOptions)
      .subscribe((dataSource: OSMDataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource,
            baseLayer: true,
            visible: true
          } satisfies LayerOptions)
        );
      });

    const wfsDataSourceOptions: WFSDataSourceOptions = {
      type: 'wfs',
      url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
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
      .subscribe((dataSource: WFSDataSource) => {
        const layerOptions: VectorLayerOptions = {
          title: 'Simple WFS ',
          maxResolution: 3000,
          visible: true,
          source: dataSource
        };
        this.map.addLayer(this.layerService.createLayer(layerOptions));
      });
  }

  paginatorChange(event: MatPaginator): void {
    this.workspacePaginator = event;
  }
}

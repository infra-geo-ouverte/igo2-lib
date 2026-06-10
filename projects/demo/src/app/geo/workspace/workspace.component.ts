import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator } from '@angular/material/paginator';

import { Action, ActionbarComponent, ActionbarMode } from '@igo2/common/action';
import {
  EntityRecord,
  EntityTableComponent,
  EntityTablePaginatorComponent,
  EntityTablePaginatorOptions,
  EntityTableScrollBehavior
} from '@igo2/common/entity';
import {
  Workspace,
  WorkspaceSelectorComponent,
  WorkspaceStore,
  WorkspaceWidgetOutletComponent
} from '@igo2/common/workspace';
import {
  AnyLayer,
  IgoGeoWorkspaceModule,
  IgoMap,
  LayerOptions,
  LayerService,
  MAP_DIRECTIVES,
  MapViewOptions,
  VectorLayerOptions,
  WorkspaceSelectorDirective,
  WorkspaceUpdatorDirective
} from '@igo2/geo';
import { WorkspaceState } from '@igo2/integration';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
  imports: [
    AsyncPipe,
    DocViewerComponent,
    ExampleViewerComponent,
    EntityTableComponent,
    ActionbarComponent,
    EntityTablePaginatorComponent,
    IgoGeoWorkspaceModule,
    MAP_DIRECTIVES,
    WorkspaceSelectorComponent,
    WorkspaceSelectorDirective,
    WorkspaceUpdatorDirective,
    WorkspaceWidgetOutletComponent,
    MatCardModule
  ]
})
export class AppWorkspaceComponent implements OnInit {
  private layerService = inject(LayerService);
  workspaceState = inject(WorkspaceState);

  public workspacePaginator?: MatPaginator;
  entitySortChange$ = new BehaviorSubject<boolean>(false);
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

  public selectedWorkspace$!: Observable<Workspace | undefined>;

  public actionbarMode: ActionbarMode = ActionbarMode.Overlay;

  public scrollBehavior: EntityTableScrollBehavior =
    EntityTableScrollBehavior.Instant;

  ngOnInit(): void {
    this.selectedWorkspace$ = this.workspaceStore.stateView
      .firstBy$(
        (record: EntityRecord<Workspace>) => record.state.selected === true
      )
      .pipe(
        map((record) => {
          const entity = record?.entity;
          if (entity) {
            // In fact, the download action is not fully functionnal into the igo2-lib demo
            // The button triggers a tool (importExport) and this tool is not available in the igo2-lib demo.
            // This is why it has been removed from the actions list.
            // Refer to the igo2 demo at https://infra-geo-ouverte.github.io/igo2/
            entity.actionStore?.view.filter((action: Action) => {
              return action.id !== 'wfsDownload';
            });
          }
          return entity;
        })
      );

    this.layerService
      .createLayers([
        {
          title: 'OSM',
          sourceOptions: {
            type: 'osm'
          },
          baseLayer: true,
          visible: true
        } satisfies LayerOptions,
        {
          title: 'NewEditionWorkspace - NOT REAL BACKEND',
          visible: true,
          workspace: {
            enabled: true
          },
          sourceOptions: {
            type: 'wfs',
            url: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
            params: {
              featureTypes: 'etablissement_mtq',
              fieldNameGeometry: 'geometry',
              version: '2.0.0',
              outputFormat: 'geojson'
            },
            // Enable edition mode so this layer is bound to NewEditionWorkspace.
            // This demo keeps write buttons disabled because no writable backend is configured.
            edition: {
              enabled: true,
              baseUrl: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
              addUrl: '?service=WFS&request=Transaction',
              deleteUrl: '?service=WFS&request=Transaction&featureId=',
              modifyUrl: '?service=WFS&request=Transaction',
              geomType: 'Point',
              hasGeometry: true,
              modifyMethod: 'post',
              modifyButton: true,
              deleteButton: true
            },
            sourceFields: [
              {
                name: 'idetablis',
                alias: 'ID',
                primary: true,
                validation: { readonly: true }
              },
              { name: 'nometablis', alias: 'Name' },
              { name: 'typetablis', alias: 'Type' }
            ]
          }
        } satisfies VectorLayerOptions,
        {
          title: 'NewEditionWorkspace - REAL BACKEND',
          visible: true,
          workspace: {
            enabled: true
          },
          sourceOptions: {
            type: 'vector',
            url: 'http://localhost:5000/collections/test/items',
            params: {
              featureTypes: 'etablissement_mtq',
              fieldNameGeometry: 'geometry',
              version: '2.0.0',
              outputFormat: 'geojson'
            },
            // Enable edition mode so this layer is bound to NewEditionWorkspace.
            // This demo keeps write buttons disabled because no writable backend is configured.
            edition: {
              enabled: true,
              baseUrl: 'https://ws.mapserver.transports.gouv.qc.ca/swtq',
              addUrl: '?service=WFS&request=Transaction',
              deleteUrl: '?service=WFS&request=Transaction&featureId=',
              modifyUrl: '?service=WFS&request=Transaction',
              geomType: 'Point',
              hasGeometry: true,
              modifyMethod: 'post',
              modifyButton: true,
              deleteButton: true
            },
            sourceFields: [
              {
                name: 'idetablis',
                alias: 'ID',
                primary: true,
                validation: { readonly: true }
              },
              { name: 'nometablis', alias: 'Name' },
              { name: 'typetablis', alias: 'Type' }
            ]
          }
        } satisfies VectorLayerOptions
        // TODO: uncomment before merge
        // {
        //   title: 'NewEditionWorkspace - test',
        //   visible: true,
        //   workspace: {
        //     enabled: true
        //   },
        //   sourceOptions: {
        //     type: 'vector',
        //     url: 'http://localhost:5000/collections/test/items',
        //     formatOptions: {
        //       dataProjection: 'EPSG:4326',
        //       featureProjection: 'EPSG:3857'
        //     },
        //     // Enable edition mode so this layer is bound to NewEditionWorkspace.
        //     // This demo keeps write buttons disabled because no writable backend is configured.
        //     edition: {
        //       enabled: true,
        //       baseUrl: 'https://localhost:5000/collections/test/items',
        //       addUrl: '',
        //       deleteUrl: '',
        //       modifyUrl: '',
        //       geomType: 'Point',
        //       hasGeometry: true,
        //       modifyMethod: 'post',
        //       modifyButton: true,
        //       deleteButton: true
        //     }
        //   }
        // } satisfies VectorLayerOptions
      ])
      .subscribe((layers) => {
        this.map.layerController.add(
          ...layers.filter((l): l is AnyLayer => l != null)
        );
      });
  }

  paginatorChange(event: MatPaginator): void {
    this.workspacePaginator = event;
  }
}

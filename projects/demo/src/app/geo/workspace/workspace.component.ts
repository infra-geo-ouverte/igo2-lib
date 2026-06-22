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
import { IgoLanguageModule } from '@igo2/core/language';
import {
  AnyLayer,
  IgoGeoWorkspaceModule,
  IgoMap,
  LayerService,
  MAP_DIRECTIVES,
  MapViewOptions,
  WorkspaceSelectorDirective,
  WorkspaceUpdatorDirective
} from '@igo2/geo';
import { WorkspaceState } from '@igo2/integration';

import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';
import {
  FEATURES_LAYER,
  LOCAL_LAYER,
  MAP_SERVER_LAYER,
  OSM_LAYER
} from './workspace.constants';

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
    IgoLanguageModule,
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
      .createLayers([OSM_LAYER, MAP_SERVER_LAYER, FEATURES_LAYER, LOCAL_LAYER])
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

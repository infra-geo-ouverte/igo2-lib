import {
  Directive,
  OnDestroy,
  OnInit,
  inject,
  input,
  output
} from '@angular/core';

import { EntityStoreStrategy } from '@igo2/common/entity';
import {
  Workspace,
  WorkspaceSelectorComponent,
  WorkspaceStore
} from '@igo2/common/workspace';

import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
  FeatureDataSource,
  WFSDataSource,
  WMSDataSource
} from '../../datasource/shared/datasources';
import { FeatureStoreInMapExtentStrategy } from '../../feature/shared/strategies/in-map-extent';
import { OgcFilterableDataSourceOptions } from '../../filter/shared';
import { isLayerGroup } from '../../layer';
import { AnyLayer, ImageLayer, VectorLayer } from '../../layer/shared';
import { IgoMap } from '../../map/shared/map';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';
import { EditionWorkspaceFactoryService } from '../new-edition-workspace/edition-workspace-factory.service';
import { EditionWorkspaceService } from '../shared/edition-workspace.service';
import { FeatureWorkspaceService } from '../shared/feature-workspace.service';
import { WfsWorkspaceService } from '../shared/wfs-workspace.service';
import { WmsWorkspaceService } from '../shared/wms-workspace.service';
import { AnyWorkspace } from '../shared/workspace.interface';

@Directive({
  selector: '[igoWorkspaceSelector]'
})
export class WorkspaceSelectorDirective implements OnInit, OnDestroy {
  private component = inject(WorkspaceSelectorComponent);
  private wfsWorkspaceService = inject(WfsWorkspaceService);
  private wmsWorkspaceService = inject(WmsWorkspaceService);
  private editionWorkspaceService = inject(EditionWorkspaceService);
  private featureWorkspaceService = inject(FeatureWorkspaceService);
  private editionWorkspaceFactoryService = inject(
    EditionWorkspaceFactoryService
  );

  private layers$$!: Subscription;
  private entities$$: Subscription[] = [];

  readonly map = input<IgoMap>();

  readonly changeWorkspace = output<string>();
  readonly disableSwitch = output<boolean>();
  readonly relationLayers = output<ImageLayer[] | VectorLayer[]>();
  readonly rowsInMapExtentCheckCondition = output<boolean>();

  get workspaceStore(): WorkspaceStore {
    return this.component.store();
  }

  ngOnInit() {
    this.layers$$ = this.map()!
      .layerController.all$.pipe(debounceTime(50))
      .subscribe((layers) => this.onLayersChange(layers));

    this.workspaceStore?.activeWorkspace$.subscribe((ws: any) => {
      this.updateActiveWorkspaceRefreshState(ws);
    });
    this.featureWorkspaceService.ws$.subscribe((ws) => {
      this.changeWorkspace.emit(ws ?? '');
    });
    this.wmsWorkspaceService.ws$.subscribe((ws) => {
      this.changeWorkspace.emit(ws ?? '');
    });
    this.wfsWorkspaceService.ws$.subscribe((ws) => {
      this.changeWorkspace.emit(ws ?? '');
    });
    this.editionWorkspaceService.ws$.subscribe((ws) => {
      this.changeWorkspace.emit(ws ?? '');
    });
    this.editionWorkspaceService.adding$.subscribe((adding) => {
      this.disableSwitch.emit(adding);
    });
    this.editionWorkspaceService.relationLayers$.subscribe((layers) => {
      this.relationLayers.emit(layers!);
    });
    this.editionWorkspaceService.rowsInMapExtentCheckCondition$.subscribe(
      (condition) => {
        this.rowsInMapExtentCheckCondition.emit(condition);
      }
    );
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
    this.entities$$.map((entities) => entities.unsubscribe());
    this.disableAllLayerRefresh();
  }

  private onLayersChange(layers: AnyLayer[]) {
    const editableLayers = layers.filter((layer) =>
      this.layerIsEditable(layer)
    );
    const editableLayersIds = editableLayers.map((layer) => layer.id as string);

    const workspacesToAdd = editableLayers
      .map((layer: AnyLayer) => this.getOrCreateWorkspace(layer as VectorLayer))
      .filter((workspace): workspace is Workspace => workspace !== undefined);

    const workspacesToRemove = this.workspaceStore
      .all()
      .filter((workspace: Workspace) => {
        return editableLayersIds.indexOf(workspace.id as string) < 0;
      });

    if (workspacesToRemove.length > 0) {
      workspacesToRemove.forEach((workspace: Workspace) => {
        workspace.entityStore!.deactivateStrategyOfType(
          FeatureStoreInMapExtentStrategy as unknown as typeof EntityStoreStrategy
        );
        workspace.deactivate();
      });
      this.workspaceStore.state.updateMany(workspacesToRemove, {
        active: false,
        selected: false
      });
      this.workspaceStore.deleteMany(workspacesToRemove);
    }

    if (workspacesToAdd.length > 0) {
      this.workspaceStore.insertMany(workspacesToAdd);
    }
  }

  private getOrCreateWorkspace(
    layer: VectorLayer | ImageLayer
  ): Workspace | undefined {
    const workspace = this.workspaceStore.get(layer.id as string);
    if (workspace !== undefined) {
      return;
    }

    if (
      (layer.dataSource instanceof WFSDataSource ||
        layer.dataSource instanceof FeatureDataSource) &&
      layer.dataSource.options.edition?.enabled
    ) {
      const wks = this.editionWorkspaceFactoryService.createOgcApiEditionWorkspace(
        layer as VectorLayer,
        this.map()!
      );
      console.log(wks);
      return wks;
    }
    if (
      layer.dataSource instanceof WFSDataSource &&
      layer.dataSource.options.edition?.enabled !== true
    ) {
      const wfsWks = this.wfsWorkspaceService.createWorkspace(
        layer as VectorLayer,
        this.map()!
      );
      return wfsWks;
    } else if (
      layer.dataSource instanceof WMSDataSource &&
      layer.dataSource.options.edition?.enabled !== true
    ) {
      if (!layer.dataSource.options.paramsWFS) {
        return;
      }
      const wmsWks = this.wmsWorkspaceService.createWorkspace(
        layer as ImageLayer,
        this.map()!
      );
      wmsWks?.inResolutionRange$.subscribe((inResolutionRange) => {
        (layer.dataSource.options as QueryableDataSourceOptions).queryable =
          !inResolutionRange;
        (
          wmsWks.layer.dataSource.options as QueryableDataSourceOptions
        ).queryable = inResolutionRange;
      });
      return wmsWks;
    } else if (
      layer.dataSource instanceof FeatureDataSource &&
      (layer as VectorLayer).exportable === true &&
      layer.dataSource.options.edition?.enabled !== true
    ) {
      const featureWks = this.featureWorkspaceService.createWorkspace(
        layer as VectorLayer,
        this.map()!
      );
      return featureWks;
    } else if (
      layer.dataSource instanceof WMSDataSource &&
      layer.dataSource.options.edition?.enabled === true
    ) {
      const editionWks = this.editionWorkspaceService.createWorkspace(
        layer as ImageLayer,
        this.map()!
      );
      return editionWks as unknown as Workspace | undefined;
    }

    return;
  }

  private layerIsEditable(layer: AnyLayer): boolean {
    if (isLayerGroup(layer)) {
      return false;
    }
    const dataSource = layer.dataSource;
    if (dataSource instanceof WFSDataSource) {
      return true;
    }
    if (dataSource instanceof FeatureDataSource) {
      return true;
    }
    if (dataSource instanceof WMSDataSource) {
      const dataSourceOptions = (dataSource.options ||
        {}) as OgcFilterableDataSourceOptions;
      return (
        dataSourceOptions.ogcFilters?.enabled ||
        dataSource.options.paramsWFS?.featureTypes !== undefined
      );
    }

    return false;
  }

  private updateActiveWorkspaceRefreshState(
    workspace: AnyWorkspace | undefined
  ) {
    if (!workspace) return;

    this.disableAllLayerRefresh();
    this.enableLayerRefreshForWorkspace(workspace);
  }

  private enableLayerRefreshForWorkspace(workspace: AnyWorkspace) {
    const dataSource = workspace.layer.linkMaster?.layer?.dataSource;
    if (!dataSource || !(dataSource instanceof WMSDataSource)) {
      return;
    }
    if (dataSource.options?.refreshIntervalSec && !dataSource.enableRefresh) {
      dataSource.enableRefresh = true;
    }
  }

  private disableAllLayerRefresh() {
    this.workspaceStore.all().forEach((wks) => {
      const datasourceMaster = (wks as any).layer?.linkMaster?.layer
        ?.dataSource;
      if (!datasourceMaster || !(datasourceMaster instanceof WMSDataSource)) {
        return;
      }

      if (
        datasourceMaster.options.refreshIntervalSec &&
        datasourceMaster.enableRefresh
      ) {
        datasourceMaster.enableRefresh = false;
      }
    });
  }
}

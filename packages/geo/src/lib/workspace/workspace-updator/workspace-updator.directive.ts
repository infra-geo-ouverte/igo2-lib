import { Directive, Input, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { Workspace } from '@igo2/common';
import type { WorkspaceStore } from '@igo2/common';
import { Layer, ImageLayer, VectorLayer } from '../../layer/shared';
import { IgoMap } from '../../map/shared';
import {
  WFSDataSource,
  WMSDataSource,
  FeatureDataSource
} from '../../datasource';
import { OgcFilterableDataSourceOptions } from '../../filter/shared';

import { WfsWorkspaceService } from '../shared/wfs-workspace.service';
import { WmsWorkspaceService } from '../shared/wms-workspace.service';
import { EditionWorkspaceService } from '../shared/edition-workspace.service';
import { FeatureWorkspaceService } from '../shared/feature-workspace.service';
import { FeatureStoreInMapExtentStrategy } from '../../feature/shared/strategies/in-map-extent';
import { QueryableDataSourceOptions } from '../../query/shared/query.interfaces';

@Directive({
  selector: '[igoWorkspaceUpdator]'
})
export class WorkspaceUpdatorDirective implements OnInit, OnDestroy {
  private layers$$: Subscription;
  private entities$$: Subscription[] = [];

  @Input() map: IgoMap;

  @Input() workspaceStore: WorkspaceStore;

  constructor(
    private wfsWorkspaceService: WfsWorkspaceService,
    private wmsWorkspaceService: WmsWorkspaceService,
    private editionWorkspaceService: EditionWorkspaceService,
    private featureWorkspaceService: FeatureWorkspaceService
  ) {}

  ngOnInit() {
    this.layers$$ = this.map.layers$
      .pipe(debounceTime(50))
      .subscribe((layers: Layer[]) => this.onLayersChange(layers));
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
    this.entities$$.map((entities) => entities.unsubscribe());
  }

  private onLayersChange(layers: Layer[]) {
    const editableLayers = layers.filter((layer: Layer) =>
      this.layerIsEditable(layer)
    );
    const editableLayersIds = editableLayers.map((layer: Layer) => layer.id);

    const workspacesToAdd = editableLayers
      .map((layer: VectorLayer) => this.getOrCreateWorkspace(layer))
      .filter((workspace: Workspace | undefined) => workspace !== undefined);

    const workspacesToRemove = this.workspaceStore
      .all()
      .filter((workspace: Workspace) => {
        return editableLayersIds.indexOf(workspace.id) < 0;
      });

    if (workspacesToRemove.length > 0) {
      workspacesToRemove.forEach((workspace: Workspace) => {
        workspace.entityStore.deactivateStrategyOfType(
          FeatureStoreInMapExtentStrategy
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
    const workspace = this.workspaceStore.get(layer.id);
    if (workspace !== undefined) {
      return;
    }
    if (
      layer.dataSource instanceof WFSDataSource &&
      layer.dataSource.options.edition?.enabled !== true
    ) {
      const wfsWks = this.wfsWorkspaceService.createWorkspace(
        layer as VectorLayer,
        this.map
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
        this.map
      );
      wmsWks?.inResolutionRange$.subscribe((inResolutionRange) => {
        if (
          (layer.dataSource.options as QueryableDataSourceOptions)
            ?.queryFormatAsWms
        ) {
          (
            wmsWks.layer.dataSource.options as QueryableDataSourceOptions
          ).queryable = true;
          return wmsWks;
        }
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
        this.map
      );
      return featureWks;
    } else if (
      layer.dataSource instanceof WMSDataSource &&
      layer.dataSource.options.edition?.enabled === true
    ) {
      const editionWks = this.editionWorkspaceService.createWorkspace(
        layer as ImageLayer,
        this.map
      );
      return editionWks;
    }

    return;
  }

  private layerIsEditable(layer: Layer): boolean {
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
}

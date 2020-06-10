import { Directive, Input, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { debounceTime, skipWhile, first } from 'rxjs/operators';

import { Workspace, WorkspaceStore, WorkspaceSelectorComponent } from '@igo2/common';

import { Layer, ImageLayer, VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { WFSDataSource, WMSDataSource, FeatureDataSource } from '../../datasource';
import { OgcFilterableDataSourceOptions } from '../../filter';

import { WfsWorkspaceService } from '../shared/wfs-workspace.service';
import { WmsWorkspaceService } from '../shared/wms-workspace.service';
import { FeatureWorkspaceService } from '../shared/feature-workspace.service';
import { Feature } from '../../feature/shared/feature.interfaces';

@Directive({
  selector: '[igoWorkspaceSelector]'
})
export class WorkspaceSelectorDirective implements OnInit, OnDestroy {

  private layers$$: Subscription;
  private entities$$: Subscription[] = [];

  @Input() map: IgoMap;

  get workspaceStore(): WorkspaceStore {
    return this.component.store;
  }

  constructor(
    private component: WorkspaceSelectorComponent,
    private wfsWorkspaceService: WfsWorkspaceService,
    private wmsWorkspaceService: WmsWorkspaceService,
    private featureWorkspaceService: FeatureWorkspaceService
  ) {}

  ngOnInit() {
    this.layers$$ = this.map.layers$
      .pipe(debounceTime(50))
      .subscribe((layers: Layer[]) =>
        this.onLayersChange(layers)
      );
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
    this.entities$$.map(entities => entities.unsubscribe());
  }

  private onLayersChange(layers: Layer[]) {
    const editableLayers = layers.filter((layer: Layer) =>
      this.layerIsEditable(layer)
    );
    const editableLayersIds = editableLayers.map((layer: Layer) => layer.id);

    const workspacesToAdd = editableLayers
      .map((layer: VectorLayer) => this.getOrCreateWorkspace(layer))
      .filter((workspace: Workspace | undefined) => workspace !== undefined);

    const workspacesToRemove = this.workspaceStore.all()
      .filter((workspace: Workspace) => {
        return editableLayersIds.indexOf(workspace.id) < 0;
      });

    if (workspacesToRemove.length > 0) {
      workspacesToRemove.forEach((workspace: Workspace) => {
        workspace.deactivate();
      });
      this.workspaceStore.state.updateMany(workspacesToRemove, {active: false, selected: false});
      this.workspaceStore.deleteMany(workspacesToRemove);
    }

    if (workspacesToAdd.length > 0) {
      this.workspaceStore.insertMany(workspacesToAdd);
    }
  }

  private getOrCreateWorkspace(layer: VectorLayer | ImageLayer): Workspace | undefined {
    const workspace = this.workspaceStore.get(layer.id);
    if (workspace !== undefined) {
      return;
    }
    if (layer.dataSource instanceof WFSDataSource) {
      const wfsWks = this.wfsWorkspaceService.createWorkspace(layer as VectorLayer, this.map);
      this.computeTableTemplate(wfsWks);
      return wfsWks;
    } else if (layer.dataSource instanceof WMSDataSource) {
      return this.wmsWorkspaceService.createWorkspace(layer as ImageLayer, this.map);
    } else if (layer.dataSource instanceof FeatureDataSource && (layer as VectorLayer).exportable === true) {
      const featureWks = this.featureWorkspaceService.createWorkspace(layer as VectorLayer, this.map);
      this.computeTableTemplate(featureWks);
      return featureWks;
    }

    return;
  }

  private computeTableTemplate(workspace: Workspace) {
    this.entities$$.push(workspace.entityStore.entities$.pipe(
      skipWhile(val => val.length === 0),
      first()
    ).subscribe(entities => {
      if (
        entities.length > 0 &&
        workspace &&
        workspace.meta.tableTemplate.columns.length === 0 &&
        workspace.entityStore.entities$.value.length > 0) {
        workspace.meta.tableTemplate.columns = (entities[0] as Feature).ol.getKeys()
        .filter(
          col => !col.startsWith('_') &&
          col !== 'geometry' &&
          col !== (entities[0] as Feature).ol.getGeometryName() &&
          !col.match(/boundedby/gi))
        .map(key => {
          return {
            name: `properties.${key}`,
            title: key
          };
        });
      }
    }));
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
        dataSourceOptions.ogcFilters && dataSourceOptions.ogcFilters.enabled
      );
    }

    return false;
  }
}

import { Inject, Injectable } from '@angular/core';

import { Action, Widget, EntityStoreFilterCustomFuncStrategy, EntityStoreFilterSelectionStrategy } from '@igo2/common';
import { BehaviorSubject } from 'rxjs';
import {
  WfsWorkspace,
  mapExtentStrategyActiveToolTip,
  FeatureMotionStrategyActiveToolTip,
  FeatureStoreSelectionStrategy,
  FeatureMotion,
  noElementSelected,
  ExportOptions,
  OgcFilterWidget
} from '@igo2/geo';
import { StorageService, StorageScope } from '@igo2/core';
import { StorageState } from '../../app/storage/storage.state';

@Injectable({
  providedIn: 'root'
})
export class WfsActionsService {

  toolToActivate$: BehaviorSubject<{ tool: string; options: {[key: string]: any} }> = new BehaviorSubject(undefined);

  get storageService(): StorageService {
    return this.storageState.storageService;
  }

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  get rowsInMapExtent(): boolean {
    return this.storageService.get('rowsInMapExtent') as boolean;
  }

  constructor(@Inject(OgcFilterWidget) private ogcFilterWidget: Widget, private storageState: StorageState) {}

  loadActions(workspace: WfsWorkspace) {
    const actions = this.buildActions(workspace);
    workspace.actionStore.load(actions);
  }

  buildActions(workspace: WfsWorkspace): Action[] {
    return [
      {
        id: 'filterInMapExtent',
        checkbox: true,
        title: 'igo.geo.workspace.inMapExtent.title',
        tooltip: mapExtentStrategyActiveToolTip(workspace),
        checkCondition: this.rowsInMapExtent,
        handler: () => {
          const filterStrategy = workspace.entityStore
          .getStrategyOfType(EntityStoreFilterCustomFuncStrategy);
          if (filterStrategy.active) {
            filterStrategy.deactivate();
          } else {
            filterStrategy.activate();
          }
          this.storageService.set('rowsInMapExtent', !this.storageService.get('rowsInMapExtent') as boolean, StorageScope.SESSION);
        }
      },
      {
        id: 'ogcFilter',
        icon: 'filter',
        title: 'igo.geo.workspace.ogcFilter.title',
        tooltip: 'igo.geo.workspace.ogcFilter.tooltip',
        handler: (widget: Widget, ws: WfsWorkspace) => {
          ws.activateWidget(widget, {
            map: ws.map,
            layer: ws.layer
          });
        },
        args: [this.ogcFilterWidget, workspace]
      },
      {
        id: 'wfsDownload',
        icon: 'download',
        title: 'igo.geo.workspace.download.title',
        tooltip: 'igo.geo.workspace.download.tooltip',
        handler: (ws: WfsWorkspace) => {
          const filterStrategy = ws.entityStore.getStrategyOfType(EntityStoreFilterCustomFuncStrategy);
          const filterSelectionStrategy = ws.entityStore.getStrategyOfType(EntityStoreFilterSelectionStrategy);
          const layersWithSelection = filterSelectionStrategy.active ? [ws.layer.id] : [];
          this.toolToActivate$.next({
            tool: 'importExport',
            options: { layers: [ws.layer.id], featureInMapExtent: filterStrategy.active, layersWithSelection } as ExportOptions
          });
        },
        args: [workspace]
      },
      {
        id: 'zoomAuto',
        checkbox: true,
        title: 'igo.geo.workspace.zoomAuto.title',
        tooltip: FeatureMotionStrategyActiveToolTip(workspace),
        checkCondition: this.zoomAuto,
        handler: () => {
          const zoomStrategy = workspace.entityStore
          .getStrategyOfType(FeatureStoreSelectionStrategy) as FeatureStoreSelectionStrategy;
          this.storageService.set('zoomAuto', !this.storageService.get('zoomAuto') as boolean);
          zoomStrategy.setMotion(this.zoomAuto ? FeatureMotion.Default : FeatureMotion.None);
        }
      },
      {
        id: 'selectedOnly',
        checkbox: true,
        title: 'igo.geo.workspace.selected.title',
        tooltip: 'selectedOnly',
        checkCondition: false,
        handler: () => {
          const filterStrategy = workspace.entityStore
          .getStrategyOfType(EntityStoreFilterSelectionStrategy);
          if (filterStrategy.active) {
            filterStrategy.deactivate();
          } else {
            filterStrategy.activate();
          }
        }
      },
      {
        id: 'clearselection',
        icon: 'select-off',
        title: 'igo.geo.workspace.clearSelection.title',
        tooltip: 'igo.geo.workspace.clearSelection.tooltip',
        handler: (ws: WfsWorkspace) => {
          ws.entityStore.state.updateMany(ws.entityStore.view.all(), { selected: false });
        },
        args: [workspace],
        availability: (ws: WfsWorkspace) => noElementSelected(ws)
      },
    ];
  }
}

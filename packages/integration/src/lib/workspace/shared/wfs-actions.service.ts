import { Inject, Injectable, OnDestroy } from '@angular/core';

import { Action, Widget, EntityStoreFilterCustomFuncStrategy, EntityStoreFilterSelectionStrategy } from '@igo2/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
  WfsWorkspace,
  mapExtentStrategyActiveToolTip,
  FeatureStoreSelectionStrategy,
  FeatureMotion,
  noElementSelected,
  ExportOptions,
  OgcFilterWidget,
  OgcFilterableDataSource
} from '@igo2/geo';
import { StorageService, StorageScope, StorageServiceEvent } from '@igo2/core';
import { StorageState } from '../../storage/storage.state';
import { skipWhile } from 'rxjs/operators';
import { ToolState } from '../../tool/tool.state';

@Injectable({
  providedIn: 'root'
})
export class WfsActionsService implements OnDestroy  {

  zoomAuto$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private storageChange$$: Subscription;

  get storageService(): StorageService {
    return this.storageState.storageService;
  }

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  get rowsInMapExtent(): boolean {
    return this.storageService.get('rowsInMapExtent') as boolean;
  }

  constructor(
    @Inject(OgcFilterWidget) private ogcFilterWidget: Widget,
    private storageState: StorageState,
    private toolState: ToolState) {}

  ngOnDestroy(): void {
    if (this.storageChange$$) {
      this.storageChange$$.unsubscribe();
    }
  }

  loadActions(workspace: WfsWorkspace) {
    const actions = this.buildActions(workspace);
    workspace.actionStore.load(actions);
  }

  buildActions(workspace: WfsWorkspace): Action[] {
    this.zoomAuto$.next(this.zoomAuto);
    this.storageService.storageChange$
      .pipe(skipWhile((storageChange: StorageServiceEvent) => storageChange.key !== 'zoomAuto'))
      .subscribe(() => {
        this.zoomAuto$.next(this.zoomAuto);
        this.handleZoomAuto(workspace);
      }
      );
    const actions = [
      {
        id: 'zoomAuto',
        checkbox: true,
        title: 'igo.integration.workspace.zoomAuto.title',
        tooltip: 'igo.integration.workspace.zoomAuto.tooltip',
        checkCondition: this.zoomAuto$,
        handler: () => {
          this.handleZoomAuto(workspace);
          this.storageService.set('zoomAuto', !this.storageService.get('zoomAuto') as boolean);
        }
      },
      {
        id: 'filterInMapExtent',
        checkbox: true,
        title: 'igo.integration.workspace.inMapExtent.title',
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
        id: 'selectedOnly',
        checkbox: true,
        title: 'igo.integration.workspace.selected.title',
        tooltip: 'igo.integration.workspace.selected.title',
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
        title: 'igo.integration.workspace.clearSelection.title',
        tooltip: 'igo.integration.workspace.clearSelection.tooltip',
        handler: (ws: WfsWorkspace) => {
          ws.entityStore.state.updateMany(ws.entityStore.view.all(), { selected: false });
        },
        args: [workspace],
        availability: (ws: WfsWorkspace) => noElementSelected(ws)
      },
      {
        id: 'wfsDownload',
        icon: 'file-export',
        title: 'igo.integration.workspace.download.title',
        tooltip: 'igo.integration.workspace.download.tooltip',
        handler: (ws: WfsWorkspace) => {
          const filterStrategy = ws.entityStore.getStrategyOfType(EntityStoreFilterCustomFuncStrategy);
          const filterSelectionStrategy = ws.entityStore.getStrategyOfType(EntityStoreFilterSelectionStrategy);
          const layersWithSelection = filterSelectionStrategy.active ? [ws.layer.id] : [];
          this.toolState.toolToActivateFromOptions({
            tool: 'importExport',
            options: { layers: [ws.layer.id], featureInMapExtent: filterStrategy.active, layersWithSelection } as ExportOptions
          });
        },
        args: [workspace]
      },
      {
        id: 'ogcFilter',
        icon: 'filter',
        title: 'igo.integration.workspace.ogcFilter.title',
        tooltip: 'igo.integration.workspace.ogcFilter.tooltip',
        handler: (widget: Widget, ws: WfsWorkspace) => {
          ws.activateWidget(widget, {
            map: ws.map,
            layer: ws.layer
          });
        },
        args: [this.ogcFilterWidget, workspace]
      },
    ];
    return (workspace.layer.dataSource as OgcFilterableDataSource).ogcFilters$?.value?.enabled ?
    actions : actions.filter(action => action.id !== 'ogcFilter');
  }

  private handleZoomAuto(workspace: WfsWorkspace) {
    const zoomStrategy = workspace.entityStore
      .getStrategyOfType(FeatureStoreSelectionStrategy) as FeatureStoreSelectionStrategy;
    zoomStrategy.setMotion(this.zoomAuto ? FeatureMotion.Default : FeatureMotion.None);
  }
}

import { Inject, Injectable } from '@angular/core';

import { Action, Widget, EntityStoreFilterCustomFuncStrategy } from '@igo2/common';

import { OgcFilterWidget } from '../widgets/widgets';
import { WfsWorkspace } from './wfs-workspace';
import { mapExtentStrategyActiveIcon, mapExtentStrategyActiveToolTip, FeatureMotionStrategyActiveToolTip } from './workspace.utils';
import { ExportOptions } from '../../import-export/shared/export.interface';
import { StorageService } from '@igo2/core';
import { FeatureMotion } from '../../feature';
import { FeatureStoreSelectionStrategy } from '../../feature/shared/strategies/selection';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WfsActionsService {

  toolToActivate$: BehaviorSubject<{ tool: string; options: {[key: string]: any} }> = new BehaviorSubject(undefined);

  get zoomAutoTable(): boolean {
    return this.storageService.get('zoomAutoTable') as boolean;
  }

  get rowsInMapExtent(): boolean {
    return this.storageService.get('rowsInMapExtent') as boolean;
  }

  constructor(@Inject(OgcFilterWidget) private ogcFilterWidget: Widget, private storageService: StorageService) {}

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
          this.storageService.set('rowsInMapExtent', !this.storageService.get('rowsInMapExtent') as boolean);
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
        title: 'igo.geo.workspace.wfsDownload.title',
        tooltip: 'igo.geo.workspace.wfsDownload.tooltip',
        handler: (ws: WfsWorkspace) => {
          const filterStrategy = ws.entityStore.getStrategyOfType(EntityStoreFilterCustomFuncStrategy);
          this.toolToActivate$.next({
            tool: 'importExport',
            options: { layer: [ws.layer.id], featureInMapExtent: filterStrategy.active } as ExportOptions
          });
        },
        args: [workspace]
      },
      {
        id: 'zoomAuto',
        checkbox: true,
        title: 'igo.geo.workspace.zoomAuto.title',
        tooltip: FeatureMotionStrategyActiveToolTip(workspace),
        checkCondition: this.zoomAutoTable,
        handler: () => {
          const zoomStrategy = workspace.entityStore
          .getStrategyOfType(FeatureStoreSelectionStrategy) as FeatureStoreSelectionStrategy;
          this.storageService.set('zoomAutoTable', !this.storageService.get('zoomAutoTable') as boolean);
          zoomStrategy.setMotion(this.zoomAutoTable ? FeatureMotion.Default : FeatureMotion.None);
        }
      },
    ];
  }
}

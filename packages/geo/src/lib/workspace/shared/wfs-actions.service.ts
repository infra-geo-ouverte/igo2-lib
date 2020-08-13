import { Inject, Injectable } from '@angular/core';

import { Action, Widget, EntityStoreFilterCustomFuncStrategy } from '@igo2/common';

import { OgcFilterWidget } from '../widgets/widgets';
import { WfsWorkspace } from './wfs-workspace';
import { mapExtentStrategyActiveIcon, mapExtentStrategyActiveToolTip, FeatureMotionStrategyActiveToolTip } from './workspace.utils';
import { ExportOptions } from '../../import-export/shared/export.interface';
import { StorageService } from '@igo2/core';
import { FeatureMotion } from '../../feature';
import { FeatureStoreSelectionStrategy } from '../../feature/shared/strategies/selection';

@Injectable({
  providedIn: 'root'
})
export class WfsActionsService {

  get zoomAutoTable(): boolean {
    return this.storageService.get('zoomAutoTable') as boolean;
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
        icon: mapExtentStrategyActiveIcon(workspace),
        title: 'igo.geo.workspace.inMapExtent.title',
        tooltip: mapExtentStrategyActiveToolTip(workspace),
        args: [workspace],
        handler: (ws: WfsWorkspace) => {
          const filterStrategy = ws.entityStore
          .getStrategyOfType(EntityStoreFilterCustomFuncStrategy);
          if (filterStrategy.active) {
            filterStrategy.deactivate();
          } else {
            filterStrategy.activate();
          }
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
          ws.toolToActivate$.next({
            toolbox: 'importExport',
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

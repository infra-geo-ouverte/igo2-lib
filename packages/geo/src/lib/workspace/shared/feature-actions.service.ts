import { Injectable } from '@angular/core';

import { Action, EntityStoreFilterCustomFuncStrategy } from '@igo2/common';

import { FeatureWorkspace } from './feature-workspace';
import { mapExtentStrategyActiveIcon, mapExtentStrategyActiveToolTip } from './workspace.utils';
import { ExportOptions } from '../../import-export';

@Injectable({
  providedIn: 'root'
})
export class FeatureActionsService {

  constructor() {}

  loadActions(workspace: FeatureWorkspace) {
    const actions = this.buildActions(workspace);
    workspace.actionStore.load(actions);
  }

  buildActions(workspace: FeatureWorkspace): Action[] {
    return [
      {
        id: 'filterInMapExtent',
        icon: mapExtentStrategyActiveIcon(workspace),
        title: 'igo.geo.workspace.inMapExtent.title',
        tooltip: mapExtentStrategyActiveToolTip(workspace),
        args: [workspace],
        handler: (ws: FeatureWorkspace) => {
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
        id: 'featureDownload',
        icon: 'download',
        title: 'igo.geo.workspace.wfsDownload.title',
        tooltip: 'igo.geo.workspace.wfsDownload.tooltip',
        handler: (ws: FeatureWorkspace) => {
          const filterStrategy = ws.entityStore.getStrategyOfType(EntityStoreFilterCustomFuncStrategy);
          ws.toolToActivate$.next({
            toolbox: 'importExport',
            options: { layer: ws.layer.id, featureInMapExtent: filterStrategy.active } as ExportOptions
          });
        },
        args: [workspace]
      }
    ];
  }
}

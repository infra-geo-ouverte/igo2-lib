import { Inject, Injectable } from '@angular/core';

import { Action, Widget, EntityStoreFilterCustomFuncStrategy } from '@igo2/common';

import { DownloadService } from '../../download/shared/download.service';
import { OgcFilterWidget } from '../widgets/widgets';
import { WfsWorkspace } from './wfs-workspace';
import { mapExtentStrategyActiveIcon, mapExtentStrategyActiveToolTip } from './workspace.utils';

@Injectable({
  providedIn: 'root'
})
export class WfsActionsService {

  constructor(
    @Inject(OgcFilterWidget) private ogcFilterWidget: Widget,
    private downloadService: DownloadService
  ) {}

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
        handler: (ws: WfsWorkspace) => this.downloadService.open(ws.layer),
        args: [workspace]
      }
    ];
  }
}

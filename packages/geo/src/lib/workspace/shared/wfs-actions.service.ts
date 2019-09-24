import { Inject, Injectable } from '@angular/core';

import { Action, Widget } from '@igo2/common';

import { DownloadService } from '../../download';
import { OgcFilterWidget } from '../widgets';
import { WfsWorkspace } from './wfs-workspace';

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
        id: 'ogcFilter',
        icon: 'filter-list',
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

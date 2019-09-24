import { Inject, Injectable } from '@angular/core';

import { Action, Widget } from '@igo2/common';

import { OgcFilterWidget } from '../widgets';
import { WmsWorkspace } from './wms-workspace';

@Injectable({
  providedIn: 'root'
})
export class WmsActionsService {

  constructor(
    @Inject(OgcFilterWidget) private ogcFilterWidget: Widget
  ) {}

  buildActions(workspace: WmsWorkspace): Action[] {
    return [
      {
        id: 'ogcFilter',
        icon: 'filter-list',
        title: 'igo.geo.workspace.ogcFilter.title',
        tooltip: 'igo.geo.workspace.ogcFilter.tooltip',
        handler: (widget: Widget, ws: WmsWorkspace) => {
          ws.activateWidget(widget, {
            map: ws.map,
            layer: ws.layer
          });
        },
        args: [this.ogcFilterWidget, workspace]
      }
    ];
  }
}

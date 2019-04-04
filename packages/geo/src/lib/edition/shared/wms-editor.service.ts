import { Inject, Injectable } from '@angular/core';

import {
  Action,
  ActionStore,
  Editor,
  Widget
} from '@igo2/common';

import { ImageLayer } from '../../layer';
import { IgoMap } from '../../map';

import { OgcFilterWidget } from './widgets';

@Injectable({
  providedIn: 'root'
})
export class WmsEditorService {

  constructor(
    @Inject(OgcFilterWidget) private ogcFilterWidget: Widget
  ) {}

  createEditor(layer: ImageLayer, map: IgoMap): Editor {
    const actionStore = new ActionStore([]);
    const editor = new Editor({
      id: layer.id,
      title: layer.title,
      tableTemplate: undefined,
      entityStore: undefined,
      actionStore
    });
    actionStore.load(this.buildActions(editor, layer, map));

    return editor;
  }

  private buildActions(editor: Editor, layer: ImageLayer, map: IgoMap): Action[] {
    return [
      {
        id: 'ogcFilter',
        icon: 'filter_list',
        title: 'igo.geo.edition.ogcFilter.title',
        tooltip: 'igo.geo.edition.ogcFilter.tooltip',
        handler: () => editor.activateWidget(this.ogcFilterWidget, {
          layer,
          map,
        }),
        conditions: []
      }
    ];
  }

}

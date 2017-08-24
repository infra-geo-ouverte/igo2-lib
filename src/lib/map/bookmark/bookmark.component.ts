import { Component, Input } from '@angular/core';
import { MdDialog } from '@angular/material';

import { uuid } from '../../utils/uuid';
import { MessageService } from '../../core';
import { ContextService } from '../../context/shared';
import { ToolService } from '../../tool/shared';
import { IgoMap } from '../shared';
import { BookmarkDialogComponent } from './bookmark-dialog.component';

@Component({
  selector: 'igo-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.styl']
})
export class BookmarkComponent {

  @Input()
  get map(): IgoMap { return this._map; }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get color(): string { return this._color; }
  set color(value: string) {
    this._color = value;
  }
  private _color: string;

  constructor(
    private dialog: MdDialog,
    private contextService: ContextService,
    private toolService: ToolService,
    private messageService: MessageService
  ) { }

  createContext() {
    const view = this.map.ol.getView();
    let context = {
      uri: uuid(),
      title: '',
      scope: 'private',
      map: {
        view: {
          center: view.getCenter(),
          zoom: view.getZoom(),
          projection: view.getProjection().getCode()
        }
      },
      layers: [],
      tools: []
    };

    const layers = this.map.layers$.getValue();
    for (const l of layers) {
        const layer: any = l;
        const opts = {
          id: layer.options.id ? String(layer.options.id) : undefined,
          title: layer.options.title,
          type: layer.options.type,
          source: {
            params: layer.dataSource.options.params,
            url: layer.dataSource.options.url
          }
        }
        context.layers.push(opts);
    }

    const tools = this.toolService.tools$.value;
    for (let key in tools) {
        context.tools.push({
          id: String(tools[key].id)
        });
    }

    this.dialog.open(BookmarkDialogComponent, {disableClose: false})
      .afterClosed().subscribe((title) => {
        if (title) {
          context.title = title;
          this.contextService.create(context).subscribe(() => {
            const message = `The context '${context.title}' was created`;
            this.messageService.info(message, 'Context created');
          });
        }
      });
  }

}

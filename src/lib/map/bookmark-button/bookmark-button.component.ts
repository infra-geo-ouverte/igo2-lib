import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { uuid } from '../../utils/uuid';
import { MessageService, LanguageService } from '../../core';
import { ContextService } from '../../context/shared/context.service';
import { ToolService } from '../../tool/shared';
import { IgoMap } from '../shared';
import { BookmarkDialogComponent } from './bookmark-dialog.component';

@Component({
  selector: 'igo-bookmark-button',
  templateUrl: './bookmark-button.component.html',
  styleUrls: ['./bookmark-button.component.styl']
})
export class BookmarkButtonComponent {

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
    private dialog: MatDialog,
    private contextService: ContextService,
    private toolService: ToolService,
    private languageService: LanguageService,
    private messageService: MessageService
  ) {}

  createContext() {
    const view = this.map.ol.getView();
    const proj = view.getProjection().getCode();
    const center: any = new ol.geom.Point(view.getCenter()).transform(proj, 'EPSG:4326');

    const context = {
      uri: uuid(),
      title: '',
      scope: 'private',
      map: {
        view: {
          center: center.getCoordinates(),
          zoom: view.getZoom(),
          projection: proj
        }
      },
      layers: [],
      tools: []
    };

    const layers = this.map.layers$.getValue();

    let order = layers.length;
    for (const l of layers) {
        const layer: any = l;
        const opts = {
          id: layer.options.id ? String(layer.options.id) : undefined,
          title: layer.options.title,
          type: layer.options.type,
          source: {
            params: layer.dataSource.options.params,
            url: layer.dataSource.options.url
          },
          order: order--,
          visible: layer.visible
        };
        context.layers.push(opts);
    }

    const tools = this.toolService.tools$.value;
    for (const key in tools) {
      if (tools.hasOwnProperty(key)) {
        context.tools.push({
          id: String(tools[key].id)
        });
      }
    }

    this.dialog.open(BookmarkDialogComponent, {disableClose: false})
      .afterClosed().subscribe((title) => {
        if (title) {
          context.title = title;
          this.contextService.create(context).subscribe(() => {
            const translate = this.languageService.translate;
            const titleD = translate.instant('igo.bookmarkButton.dialog.createTitle');
            const message = translate.instant('igo.bookmarkButton.dialog.createMsg', {
              value: context.title
            });
            this.messageService.info(message, titleD);
          });
        }
      });
  }

}

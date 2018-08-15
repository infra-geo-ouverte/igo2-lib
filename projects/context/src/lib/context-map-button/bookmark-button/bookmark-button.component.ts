import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { MessageService, LanguageService } from '@igo2/core';
import { IgoMap } from '@igo2/geo';

import { ContextService } from '../../context-manager/shared/context.service';
import { BookmarkDialogComponent } from './bookmark-dialog.component';

@Component({
  selector: 'igo-bookmark-button',
  templateUrl: './bookmark-button.component.html',
  styleUrls: ['./bookmark-button.component.scss']
})
export class BookmarkButtonComponent {
  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get color(): string {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color: string;

  constructor(
    private dialog: MatDialog,
    private contextService: ContextService,
    private languageService: LanguageService,
    private messageService: MessageService
  ) {}

  createContext() {
    this.dialog
      .open(BookmarkDialogComponent, { disableClose: false })
      .afterClosed()
      .subscribe(title => {
        if (title) {
          const context = this.contextService.getContextFromMap(this.map);
          context.title = title;
          this.contextService.create(context).subscribe(() => {
            const translate = this.languageService.translate;
            const titleD = translate.instant(
              'igo.geo.bookmarkButton.dialog.createTitle'
            );
            const message = translate.instant(
              'igo.geo.bookmarkButton.dialog.createMsg',
              {
                value: context.title
              }
            );
            this.messageService.success(message, titleD);
          });
        }
      });
  }
}

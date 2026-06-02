import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import type { IgoMap } from '@igo2/geo';

import { take } from 'rxjs/operators';

import { ContextService } from '../../context-manager/shared/context.service';
import { BookmarkDialogComponent } from './bookmark-dialog.component';

@Component({
  selector: 'igo-bookmark-button',
  templateUrl: './bookmark-button.component.html',
  styleUrls: ['./bookmark-button.component.scss'],
  imports: [MatButtonModule, MatTooltipModule, MatIconModule, IgoLanguageModule]
})
export class BookmarkButtonComponent {
  private dialog = inject(MatDialog);
  private contextService = inject(ContextService);
  private messageService = inject(MessageService);

  readonly map = input.required<IgoMap>();
  readonly color = input<string>();

  createContext() {
    this.dialog
      .open(BookmarkDialogComponent, { disableClose: false })
      .afterClosed()
      .pipe(take(1))
      .subscribe((title) => {
        if (title) {
          const context = this.contextService.getContextFromMap(this.map());
          context.title = title;
          this.contextService.create(context).subscribe(() => {
            this.messageService.success(
              'igo.context.bookmarkButton.dialog.createMsg',
              'igo.context.bookmarkButton.dialog.createTitle',
              undefined,
              { value: context.title }
            );
            this.contextService.loadContext(context.uri!);
          });
        }
      });
  }
}

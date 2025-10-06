import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { JsonDialogComponent } from './json-dialog.component';

@Injectable()
export class JsonDialogService {
  private dialog = inject(MatDialog);

  public open(title: any, data, ignoreKeys?: string[]): Observable<any> {
    const dialogRef = this.dialog.open(JsonDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.data = data;
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.ignoreKeys = ignoreKeys ?? [];

    return dialogRef.afterClosed();
  }
}

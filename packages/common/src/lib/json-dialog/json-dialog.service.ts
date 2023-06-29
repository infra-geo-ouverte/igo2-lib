import { Injectable } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

import { Observable } from 'rxjs';

import { JsonDialogComponent } from './json-dialog.component';

@Injectable()
export class JsonDialogService {
  constructor(private dialog: MatDialog) {}

  public open(title: any, data, ignoreKeys?: string[]): Observable<any> {
    const dialogRef = this.dialog.open(JsonDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.data = data;
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.ignoreKeys = ignoreKeys;

    return dialogRef.afterClosed();
  }
}

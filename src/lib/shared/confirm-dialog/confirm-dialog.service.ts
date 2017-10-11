import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Observable } from 'rxjs/Observable';

import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable()
export class ConfirmDialogService {

  constructor(private dialog: MatDialog) {}

  public open(message): Observable<any> {
     const dialogRef = this.dialog.open(ConfirmDialogComponent, {
       disableClose: false
     });
     dialogRef.componentInstance.confirmMessage = message;

     return dialogRef.afterClosed();
   }

}

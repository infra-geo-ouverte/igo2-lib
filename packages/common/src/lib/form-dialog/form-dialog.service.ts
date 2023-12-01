import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { FormFieldConfig } from '../form/shared/form.interfaces';
import { FormDialogComponent } from './form-dialog.component';
import { FormDialogData, FormDialogOptions } from './form-dialog.interface';

@Injectable()
export class FormDialogService {
  constructor(private dialog: MatDialog) {}

  public open(
    formFieldConfig: FormFieldConfig[],
    options?: FormDialogOptions
  ): Observable<{ [key: string]: any }> {
    const data: FormDialogData = {
      formFieldConfig,
      ...options
    };
    const dialogRef = this.dialog.open(FormDialogComponent, {
      disableClose: false,
      data
    });
    return dialogRef.afterClosed();
  }
}

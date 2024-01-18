import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { FormDialogComponent } from './form-dialog.component';
import {
  FormDialogData,
  FormDialogFormConfig,
  FormDialogOptions
} from './form-dialog.interface';

@Injectable()
export class FormDialogService {
  constructor(private dialog: MatDialog) {}

  public open(
    formDialogConfig?: FormDialogFormConfig,
    options?: FormDialogOptions
  ): Observable<{ [key: string]: any }> {
    const data: FormDialogData = {
      formFieldConfigs: formDialogConfig.formFieldConfigs,
      formGroupsConfigs: formDialogConfig.formGroupsConfigs,
      ...options
    };
    const dialogRef = this.dialog.open(FormDialogComponent, {
      disableClose: false,
      data,
      ...options
    });
    return dialogRef.afterClosed();
  }
}

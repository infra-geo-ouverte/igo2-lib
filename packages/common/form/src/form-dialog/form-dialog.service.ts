import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { FormStepperConfig } from '../form-stepper/form-stepper.interface';
import { FormDialogComponent } from './form-dialog.component';
import {
  FormDialogData,
  FormDialogFormConfig,
  FormDialogOptions,
  FormDialogStepperData,
  FormDialogStepperOptions
} from './form-dialog.interface';
import { FormStepperDialogComponent } from './form-stepper-dialog.component';

@Injectable()
export class FormDialogService {
  private dialog = inject(MatDialog);

  public open<T extends Record<string, unknown> = Record<string, unknown>>(
    formDialogConfig?: FormDialogFormConfig,
    options?: FormDialogOptions
  ): Observable<T | undefined> {
    const data: FormDialogData = {
      formFieldConfigs: formDialogConfig?.formFieldConfigs,
      formGroupsConfigs: formDialogConfig?.formGroupsConfigs,
      ...options
    };
    const dialogRef = this.dialog.open(FormDialogComponent, {
      disableClose: false,
      data,
      ...options
    });
    return dialogRef.afterClosed() as Observable<T | undefined>;
  }

  public openStepper<
    T extends Record<string, unknown> = Record<string, unknown>
  >(
    formDialogStepperConfig: FormStepperConfig,
    options?: FormDialogStepperOptions
  ): Observable<T | undefined> {
    const data: FormDialogStepperData = {
      steps: formDialogStepperConfig.steps,
      ...options
    };
    const dialogRef = this.dialog.open(FormStepperDialogComponent, {
      disableClose: false,
      width: 'min(92vw, 44rem)',
      maxWidth: '95vw',
      data,
      ...options
    });
    return dialogRef.afterClosed() as Observable<T | undefined>;
  }
}

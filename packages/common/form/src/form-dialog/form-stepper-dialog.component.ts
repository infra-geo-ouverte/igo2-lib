import { Component, inject, viewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { IgoLanguageModule } from '@igo2/core/language';

import { FormStepperComponent } from '../form-stepper/form-stepper.component';
import { FormDialogStepperData } from './form-dialog.interface';

@Component({
  selector: 'igo-form-stepper-dialog',
  templateUrl: './form-stepper-dialog.component.html',
  styleUrls: ['./form-stepper-dialog.component.scss'],
  imports: [MatDialogModule, IgoLanguageModule, FormStepperComponent]
})
export class FormStepperDialogComponent {
  readonly formStepper = viewChild(FormStepperComponent);

  readonly dialogRef =
    inject<MatDialogRef<FormStepperDialogComponent>>(MatDialogRef);

  readonly data = inject<FormDialogStepperData>(MAT_DIALOG_DATA);

  readonly initialData: Record<string, unknown>;

  constructor() {
    if (!this.data.steps?.length) {
      throw new Error('Form stepper dialog requires at least one step.');
    }

    this.data.processButtonText =
      this.data.processButtonText ?? 'igo.common.formStepper.processButtonText';
    this.data.cancelButtonText =
      this.data.cancelButtonText ?? 'igo.common.formStepper.cancelButtonText';
    this.data.title = this.data.title ?? 'igo.common.formDialog.title';
    this.data.nextButtonText =
      this.data.nextButtonText ?? 'igo.common.formStepper.nextButtonText';
    this.data.previousButtonText =
      this.data.previousButtonText ??
      'igo.common.formStepper.previousButtonText';
    this.initialData = { ...(this.data.data$?.value ?? {}) };
  }

  onDataChange(data: Record<string, unknown>): void {
    this.data.data$?.next(data);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  onCompleted(data: Record<string, unknown>): void {
    this.data.data$?.next(data);
    this.dialogRef.close(data);
  }
}

import { Component, effect, inject, viewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { FormStepperComponent } from '../form-stepper/form-stepper.component';
import { FormStepperStepConfig } from '../form-stepper/form-stepper.interface';
import { FormDialogStepperData } from './form-dialog.interface';

export const DEFAULT_FORM_STEPPER_DIALOG_TITLE =
  'Veuillez remplir le formulaire';

@Component({
  selector: 'igo-form-stepper-dialog',
  templateUrl: './form-stepper-dialog.component.html',
  styleUrls: ['./form-stepper-dialog.component.scss'],
  imports: [MatDialogModule, FormStepperComponent]
})
export class FormStepperDialogComponent {
  readonly formStepper = viewChild(FormStepperComponent);

  readonly dialogRef =
    inject<MatDialogRef<FormStepperDialogComponent>>(MatDialogRef);

  readonly data = inject<FormDialogStepperData>(MAT_DIALOG_DATA);

  readonly initialData: Record<string, unknown>;

  private appliedPanelClasses: string[] = [];

  constructor() {
    if (!this.data.steps?.length) {
      throw new Error('Form stepper dialog requires at least one step.');
    }

    this.data.title = this.data.title ?? DEFAULT_FORM_STEPPER_DIALOG_TITLE;
    this.initialData = { ...(this.data.data$?.value ?? {}) };

    effect(() => {
      const stepper = this.formStepper();
      const activeStep = stepper ? this.tryGetActiveStep(stepper) : undefined;
      const width = activeStep?.dialogWidth ?? this.data.width;
      const height = activeStep?.dialogHeight ?? this.data.height;

      if (width || height) {
        this.dialogRef.updateSize(width, height);
      }

      this.applyPanelClasses(activeStep?.dialogPanelClass);
    });
  }

  private tryGetActiveStep(
    stepper: FormStepperComponent
  ): FormStepperStepConfig | undefined {
    try {
      return stepper.activeStep();
    } catch {
      return undefined;
    }
  }

  private applyPanelClasses(panelClasses: string | string[] | undefined): void {
    const nextClasses = panelClasses
      ? Array.isArray(panelClasses)
        ? panelClasses
        : [panelClasses]
      : [];

    if (this.appliedPanelClasses.length) {
      this.dialogRef.removePanelClass(this.appliedPanelClasses);
    }

    if (nextClasses.length) {
      this.dialogRef.addPanelClass(nextClasses);
    }

    this.appliedPanelClasses = nextClasses;
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

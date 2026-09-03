import { MatDialogConfig } from '@angular/material/dialog';

import { BehaviorSubject } from 'rxjs';

import {
  FormStepperConfig,
  FormStepperFormConfig,
  FormStepperStepConfig,
  FormStepperStepContext,
  FormStepperStepFormConfigResolver
} from '../form-stepper/form-stepper.interface';

export type FormDialogFormConfig = FormStepperFormConfig;
export type FormDialogStepContext = FormStepperStepContext;
export type FormDialogStepFormConfigResolver =
  FormStepperStepFormConfigResolver;
export type FormDialogStepConfig = FormStepperStepConfig;
export type FormDialogStepperConfig = FormStepperConfig;

export interface FormDialogData
  extends FormDialogOptions, FormDialogFormConfig {}

export interface FormDialogStepperOptions extends FormDialogOptions {
  nextButtonText?: string;
  previousButtonText?: string;
}

export interface FormDialogStepperData
  extends FormDialogStepperOptions, FormDialogStepperConfig {}

export interface FormDialogOptions extends MatDialogConfig {
  data$?: BehaviorSubject<Record<string, unknown>>;
  title?: string;
  processButtonText?: string;
  cancelButtonText?: string;
  notice?: string;
}

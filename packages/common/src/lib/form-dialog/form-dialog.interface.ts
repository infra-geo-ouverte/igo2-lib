import { BehaviorSubject } from 'rxjs';

import { FormFieldConfig } from '../form/shared/form.interfaces';

export interface FormDialogData extends FormDialogOptions {
  formFieldConfig: FormFieldConfig[];
}
export interface FormDialogOptions {
  data$?: BehaviorSubject<{ [key: string]: any }>;
  title?: string;
  processButtonText?: string;
  cancelButtonText?: string;
  notice?: string;
}

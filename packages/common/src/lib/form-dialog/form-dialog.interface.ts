import { FormFieldConfig } from '../form/shared/form.interfaces';

export interface FormDialogData extends FormDialogOptions {
  formFieldConfig: FormFieldConfig[];
}
export interface FormDialogOptions {
  title?: string;
  processButtonText?: string;
  cancelButtonText?: string;
  notice?: string;
}

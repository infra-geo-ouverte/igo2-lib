import { FormFieldConfig } from '../form/shared/form.interfaces';

export interface FormDialogData {
  formFieldConfig: FormFieldConfig[];
  title?: string;
  processButtonText?: string;
  cancelButtonText?: string;
  notice?: string;
}

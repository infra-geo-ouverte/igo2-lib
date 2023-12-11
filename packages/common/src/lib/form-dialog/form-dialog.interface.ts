import { MatDialogConfig } from '@angular/material/dialog';

import { BehaviorSubject } from 'rxjs';

import {
  FormFieldConfig,
  FormGroupsConfig
} from '../form/shared/form.interfaces';

export interface FormDialogFormConfig {
  formFieldConfigs?: FormFieldConfig[];
  formGroupsConfigs?: FormGroupsConfig[];
}
export interface FormDialogData
  extends FormDialogOptions,
    FormDialogFormConfig {}
export interface FormDialogOptions extends MatDialogConfig {
  data$?: BehaviorSubject<{ [key: string]: any }>;
  title?: string;
  processButtonText?: string;
  cancelButtonText?: string;
  notice?: string;
}

import {
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn
} from '@angular/forms';

import { BehaviorSubject } from 'rxjs';

export interface Form {
  fields: FormField[];
  groups: FormFieldGroup[];
  control: UntypedFormGroup;
}

export interface FormFieldGroupConfig {
  name: string;
  title?: string;
  options?: FormFieldGroupOptions;
}

export interface FormFieldGroup extends FormFieldGroupConfig {
  fields: FormField[];
  control: UntypedFormGroup;
}

export interface FormFieldGroupOptions {
  validator?: ValidatorFn;
  errors?: { [key: string]: string };
}
export interface FormGroupsConfig {
  name: string;
  formFieldConfigs: FormFieldConfig[];
}

export interface FormFieldConfig<T extends FormFieldInputs = FormFieldInputs> {
  name: string;
  title: string;

  type?: string;
  options?: FormFieldOptions;
  inputs?: T;
  subscribers?: FormFieldSubscribers;
}

export type FormFieldSubscribers = { [key: string]: FormFieldSubscriber };
type FormFieldSubscriber = (options: FormFieldSubscriberOptions) => void;

interface FormFieldSubscriberOptions {
  field: FormField;
  control: UntypedFormControl;
}

export interface FormField<T extends FormFieldInputs = FormFieldInputs>
  extends FormFieldConfig<T> {
  control: UntypedFormControl;
}

export interface FormFieldOptions {
  validator?: ValidatorFn;
  disabled?: boolean;
  visible?: boolean;
  cols?: number;
  errors?: { [key: string]: string };
  disableSwitch?: boolean;
}

export interface FormFieldInputs {}

export interface FormFieldSelectInputs extends FormFieldInputs {
  choices: BehaviorSubject<FormFieldSelectChoice[]> | FormFieldSelectChoice[];
}

export interface FormFieldSelectChoice {
  value: any;
  title: string;
}

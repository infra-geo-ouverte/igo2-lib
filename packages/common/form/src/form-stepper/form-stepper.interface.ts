import { FormFieldConfig, FormGroupsConfig } from '../shared/form.interfaces';

export interface FormStepperFormConfig {
  formFieldConfigs?: FormFieldConfig[];
  formGroupsConfigs?: FormGroupsConfig[];
}

export interface FormStepperStepContext {
  data: Readonly<Record<string, unknown>>;
  stepIndex: number;
  steps: readonly FormStepperStepConfig[];
}

export type FormStepperStepFormConfigResolver = (
  context: FormStepperStepContext
) => FormStepperFormConfig;

export interface FormStepperStepConfig {
  label: string;
  title?: string;
  notice?: string;
  form: FormStepperFormConfig | FormStepperStepFormConfigResolver;
}

export interface FormStepperConfig {
  steps: FormStepperStepConfig[];
}

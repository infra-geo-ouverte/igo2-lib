import {
  FormStepperFormConfig,
  FormStepperStepConfig,
  FormStepperStepContext
} from './form-stepper.interface';

export function resolveFormStepperStepFormConfig(
  step: FormStepperStepConfig,
  context: FormStepperStepContext
): FormStepperFormConfig {
  return typeof step.form === 'function' ? step.form(context) : step.form;
}

import { resolveFormStepperStepFormConfig } from '../form-stepper/form-stepper.utils';
import { buildFormFromConfig, markFormAsTouched } from '../shared/form.utils';
import {
  FormDialogFormConfig,
  FormDialogStepConfig,
  FormDialogStepContext
} from './form-dialog.interface';

export function buildFormDialogForm(
  formService: import('../shared').FormService,
  formDialogConfig?: FormDialogFormConfig
) {
  return buildFormFromConfig(formService, formDialogConfig);
}

export function resolveFormDialogStepFormConfig(
  step: FormDialogStepConfig,
  context: FormDialogStepContext
): FormDialogFormConfig {
  return resolveFormStepperStepFormConfig(step, context);
}

export function markFormDialogFormAsTouched(
  form: import('../shared').Form
): void {
  markFormAsTouched(form);
}

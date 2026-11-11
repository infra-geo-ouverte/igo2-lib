import {
  FormStepperFormConfig,
  FormStepperLabels,
  FormStepperStepConfig,
  FormStepperStepContext
} from './form-stepper.interface';

export const DEFAULT_FORM_STEPPER_LABELS: FormStepperLabels = {
  nextButton: 'Suivant',
  previousButton: 'Précédent',
  processButton: 'Confirmer',
  cancelButton: 'Annuler',
  stepCounter: 'Étape {{current}} de {{total}}'
};

export function resolveFormStepperStepFormConfig(
  step: FormStepperStepConfig,
  context: FormStepperStepContext
): FormStepperFormConfig {
  return typeof step.form === 'function' ? step.form(context) : step.form;
}

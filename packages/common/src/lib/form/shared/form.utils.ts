import { AbstractControl } from '@angular/forms';

export function formControlIsRequired(control: AbstractControl): boolean {
  if (control.validator) {
    const validator = control.validator({} as AbstractControl);
    if (validator && validator.required) {
      return true;
    }
  }

  if ((control as any).controls) {
    const requiredControl = Object.keys((control as any).controls).find((key: string) => {
      return formControlIsRequired((control as any).controls[key]);
    });
    return requiredControl !== undefined;
  }

  return false;
}

export function getDefaultErrorMessages(): {[key: string]: string} {
  return {
    required: 'igo.common.form.errors.required'
  };
}

export function getControlErrorMessage(control: AbstractControl, messages: {[key: string]: string}): string {
  const errors = control.errors || {};
  const errorKeys = Object.keys(errors);
  const errorMessages = errorKeys
    .map((key: string) => messages[key])
    .filter((message: string) => message !== undefined);
  return errorMessages.length > 0 ? errorMessages[0] : '';
}

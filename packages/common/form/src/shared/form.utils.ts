import { AbstractControl } from '@angular/forms';

import { Form, FormField } from './form.interfaces';

export function formControlIsRequired(control: AbstractControl): boolean {
  if (control.validator) {
    const validator = control.validator({} as AbstractControl);
    if (validator && validator.required) {
      return true;
    }
  }

  if ((control as any).controls) {
    const requiredControl = Object.keys((control as any).controls).find(
      (key: string) => {
        return formControlIsRequired((control as any).controls[key]);
      }
    );
    return requiredControl !== undefined;
  }

  return false;
}

export function getDefaultErrorMessages(): Record<string, string> {
  return {
    required: 'igo.common.form.errors.required',
    email: 'igo.common.form.errors.email'
  };
}

export function getControlErrorMessage(
  control: AbstractControl,
  messages: Record<string, string>
): string {
  const errors = control.errors || {};
  const errorKeys = Object.keys(errors);
  const errorMessages = errorKeys
    .map((key: string) => messages[key])
    .filter((message: string) => message !== undefined);
  return errorMessages.length > 0 ? errorMessages[0] : '';
}

export function getAllFormFields(form: Form): FormField[] {
  const fields = form.fields ? [...form.fields] : [];
  return form.groups.reduce((acc, group) => acc.concat(group.fields), fields);
}

export function getFormFieldByName(
  form: Form,
  name: string
): FormField | undefined {
  const fields = getAllFormFields(form);
  return fields.find((field: FormField) => {
    return field.name === name;
  });
}

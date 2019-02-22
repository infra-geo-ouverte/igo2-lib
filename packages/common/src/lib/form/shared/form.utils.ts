import { AbstractControl } from '@angular/forms';

export function formControlIsRequired(control: AbstractControl): boolean {
  if (control.validator) {
    const validator = control.validator({} as AbstractControl);
    if (validator && validator.required) {
      return true;
    }
  }

  if ((control as any).controls) {
    Object.keys((control as any).controls).find((key: string) => {
      return formControlIsRequired((control as any).controls[key]);
    });
  }

  return false;
}

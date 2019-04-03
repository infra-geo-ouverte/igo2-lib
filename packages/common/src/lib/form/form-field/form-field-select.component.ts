import {
  Input,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { Observable, of } from 'rxjs';

import { formControlIsRequired, getControlErrorMessage } from '../shared/form.utils';
import { FormFieldSelectChoice } from '../shared/form.interfaces';
import { FormFieldComponent } from '../shared/form-field-component';

/**
 * This component renders a select field
 */
@FormFieldComponent('select')
@Component({
  selector: 'igo-form-field-select',
  templateUrl: './form-field-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldSelectComponent {

  public choices$: Observable<FormFieldSelectChoice[]>;

  /**
   * The field's form control
   */
  @Input() formControl: FormControl;

  /**
   * Field placeholder
   */
  @Input() placeholder: string;

  /**
   * Select input choices
   */
  @Input()
  set choices(value: Observable<FormFieldSelectChoice[]> | FormFieldSelectChoice[]) {
    if (value instanceof Observable) {
      this.choices$ = value;
    } else {
      this.choices$ = of(value);
    }
  }

  /**
   * Field placeholder
   */
  @Input() errors: {[key: string]: string};

  /**
   * Whether the field is required
   */
  get required(): boolean {
    return formControlIsRequired(this.formControl);
  }

  /**
   * Get error message
   */
  getErrorMessage(): string {
    return getControlErrorMessage(this.formControl, this.errors);
  }

}

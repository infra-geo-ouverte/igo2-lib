import {
  Input,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl } from '@angular/forms';

import { formControlIsRequired, getControlErrorMessage } from '../shared/form.utils';
import { FormFieldComponent } from '../shared/form-field-component';

/**
 * This component renders a textarea field
 */
@FormFieldComponent('textarea')
@Component({
  selector: 'igo-form-field-textarea',
  templateUrl: './form-field-textarea.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldTextareaComponent {

  /**
   * The field's form control
   */
  @Input() formControl: FormControl;

  /**
   * Field placeholder
   */
  @Input() placeholder: string;

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

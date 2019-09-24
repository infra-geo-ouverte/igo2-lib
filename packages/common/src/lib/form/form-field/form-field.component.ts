import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';

import { FormField, FormFieldInputs, FormFieldOptions } from '../shared/form.interfaces';
import { FormFieldService } from '../shared/form-field.service';
import { getDefaultErrorMessages } from '../shared';

/**
 * This component renders the proper form input based on
 * the field configuration it receives.
 */
@Component({
  selector: 'igo-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent {

  /**
   * Field configuration
   */
  @Input() field: FormField;

  /**
   * Field inputs cache
   */
  private fieldInputs: FormFieldInputs = undefined;

  /**
   * Field subscribers cache
   */
  private fieldSubscribers: {[key: string]: ({field: FormField, control: FormControl}) => void } = undefined;

  get fieldOptions(): FormFieldOptions {
    return this.field.options || {};
  }

  constructor(private formFieldService: FormFieldService) {}

  getFieldComponent(): any {
    return this.formFieldService.getFieldByType(this.field.type || 'text');
  }

  getFieldInputs(): FormFieldInputs {
    if (this.fieldInputs !== undefined) {
      return this.fieldInputs;
    }

    const errors = this.fieldOptions.errors || {};
    this.fieldInputs = Object.assign(
      {
        placeholder: this.field.title,
        disableSwitch: this.fieldOptions.disableSwitch || false
      },
      Object.assign({}, this.field.inputs || {}),
      {
        formControl: this.field.control,
        errors: Object.assign({}, getDefaultErrorMessages(), errors)
      }
    );
    return this.fieldInputs;
  }

  getFieldSubscribers(): {[key: string]: ({field: FormField, control: FormControl}) => void } {
    if (this.fieldSubscribers !== undefined) {
      return this.fieldSubscribers;
    }

    this.fieldSubscribers = Object.assign({}, this.field.subscribers || {});
    return this.fieldSubscribers;
  }
}

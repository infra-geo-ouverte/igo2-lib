import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DynamicOutletComponent } from '@igo2/common/dynamic-component';

import { getDefaultErrorMessages } from '../shared';
import { FormFieldService } from '../shared/form-field.service';
import {
  FormField,
  FormFieldInputs,
  FormFieldOptions,
  FormFieldSubscribers
} from '../shared/form.interfaces';

/**
 * This component renders the proper form input based on
 * the field configuration it receives.
 */
@Component({
    selector: 'igo-form-field',
    templateUrl: './form-field.component.html',
    styleUrls: ['./form-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, DynamicOutletComponent]
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
  private fieldSubscribers: FormFieldSubscribers = undefined;

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

  getFieldSubscribers(): FormFieldSubscribers {
    if (this.fieldSubscribers !== undefined) {
      return this.fieldSubscribers;
    }

    this.fieldSubscribers = Object.assign({}, this.field.subscribers || {});
    return this.fieldSubscribers;
  }
}

import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

import { IgoLanguageModule } from '@igo2/core/language';

import { FormFieldComponent } from '../form-field/form-field.component';
import { FormField, FormFieldGroup } from '../shared/form.interfaces';
import { getControlErrorMessage } from '../shared/form.utils';

/**
 * A configurable form, optionnally bound to an entity
 * (for example in case of un update). Submitting that form
 * emits an event with the form data but no other operation is performed.
 */
@Component({
  selector: 'igo-form-group',
  templateUrl: './form-group.component.html',
  styleUrls: ['./form-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    FormFieldComponent,
    MatFormFieldModule,
    IgoLanguageModule
  ]
})
export class FormGroupComponent {
  /**
   * Form field group
   */
  @Input() group: FormFieldGroup;

  /**
   * Field placeholder
   */
  @Input() errors: { [key: string]: string };

  /**
   * Form group control
   */
  get formControl(): UntypedFormGroup {
    return this.group.control;
  }

  constructor() {}

  /**
   * Return the number of columns a field should occupy.
   * The maximum allowed is 2, even if the field config says more.
   * @param field Field
   * @returns Number of columns
   * @internal
   */
  getFieldColSpan(field: FormField): number {
    let colSpan = 2;
    const options = field.options || {};
    if (options.cols && options.cols > 0) {
      colSpan = Math.min(options.cols, 2);
    }

    return colSpan;
  }

  /**
   * Return the number of columns a field should occupy.
   * The maximum allowed is 2, even if the field config says more.
   * @param field Field
   * @returns Number of columns
   * @internal
   */
  getFieldNgClass(field: FormField): { [key: string]: boolean } {
    const colspan = this.getFieldColSpan(field);
    return { [`igo-form-field-colspan-${colspan}`]: true };
  }

  /**
   * Get error message
   */
  getErrorMessage(): string {
    const options = this.group.options || {};
    return getControlErrorMessage(this.formControl, options.errors || {});
  }
}

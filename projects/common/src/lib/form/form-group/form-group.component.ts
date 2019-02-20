import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

import { FormField, FormFieldGroup } from '../shared/form.interfaces';

/**
 * A configurable form, optionnally bound to an entity
 * (for example in case of un update). Submitting that form
 * emits an event with the form data but no other operation is performed.
 */
@Component({
  selector: 'igo-form-group',
  templateUrl: './form-group.component.html',
  styleUrls: ['./form-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormGroupComponent {

  /**
   * Form field group
   */
  @Input() group: FormFieldGroup;

  /**
   * Event emitted when the form control changes
   */
  @Output() formControlChanges = new EventEmitter<void>();

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
  getFieldNgClass(field: FormField): {[key: string]: boolean} {
    const colspan = this.getFieldColSpan(field);
    return {[`igo-form-field-colspan-${colspan}`]: true};
  }

}

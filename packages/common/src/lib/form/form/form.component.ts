import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { t } from 'typy';

import { Form, FormField, FormFieldGroup } from '../shared/form.interfaces';
import { getAllFormFields } from '../shared/form.utils';

/**
 * A configurable form
 */
@Component({
  selector: 'igo-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormComponent implements OnChanges {
  /**
   * Form
   */
  @Input() form: Form;

  /**
   * Input data
   */
  @Input() formData: { [key: string]: any };

  /**
   * Form autocomplete
   */
  @Input() autocomplete: string = 'off';

  /**
   * Event emitted when the form is submitted
   */
  @Output() submitForm = new EventEmitter<{ [key: string]: any }>();

  @ViewChild('buttons', { static: true }) buttons: ElementRef;

  get hasButtons(): boolean {
    return this.buttons.nativeElement.children.length !== 0;
  }

  constructor() {}

  /**
   * Is the entity or the template change, recreate the form or repopulate it.
   * @internal
   */
  ngOnChanges(changes: SimpleChanges) {
    const formData = changes.formData;
    if (formData && formData.currentValue !== formData.previousValue) {
      if (formData.currentValue === undefined) {
        this.clear();
      } else {
        this.setData(formData.currentValue);
      }
    }
  }

  /**
   * Transform the form data to a feature and emit an event
   * @param event Form submit event
   * @internal
   */
  onSubmit() {
    this.submitForm.emit(this.getData());
  }

  getData(): { [key: string]: any } {
    const data = {};
    getAllFormFields(this.form).forEach((field: FormField) => {
      this.updateDataWithFormField(data, field);
    });
    return data;
  }

  private setData(data: { [key: string]: any }) {
    this.form.fields.forEach((field: FormField) => {
      field.control.setValue(t(data, field.name).safeObject);
    });

    this.form.groups.forEach((group: FormFieldGroup) => {
      group.fields.forEach((field: FormField) => {
        field.control.setValue(t(data, field.name).safeObject);
      });
    });
  }

  private updateDataWithFormField(
    data: { [key: string]: any },
    field: FormField
  ) {
    const control = field.control;
    if (!control.disabled) {
      data[field.name] = control.value;
    }
  }

  /**
   * Clear form
   */
  private clear() {
    this.form.control.reset();
  }
}

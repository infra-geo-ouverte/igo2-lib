import { NgClass } from '@angular/common';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, NgClass]
})
export class FormComponent implements OnChanges {
  /**
   * Form
   */
  @Input() form: Form;

  /**
   * Input data
   */
  @Input() formData: Record<string, any>;

  /**
   * Form autocomplete
   */
  @Input() autocomplete = 'off';

  /**
   * Event emitted when the form is submitted
   */
  @Output() submitForm = new EventEmitter<Record<string, any>>();

  @ViewChild('buttons', { static: true }) buttons: ElementRef;

  get hasButtons(): boolean {
    return this.buttons.nativeElement.children.length !== 0;
  }

  /**
   * Is the entity or the template change, recreate the form or repopulate it.
   * @internal
   */
  ngOnChanges(changes: SimpleChanges) {
    const formData = changes.formData;
    if (formData.firstChange && formData.currentValue == null) {
      return;
    }

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

  getData(): Record<string, any> {
    const data = {};
    getAllFormFields(this.form).forEach((field: FormField) => {
      this.updateDataWithFormField(data, field);
    });
    return data;
  }

  private setData(data: Record<string, any>) {
    this.form.fields.forEach((field: FormField) => {
      field.control.setValue(t(data, field.name).safeObject);
    });

    this.form.groups.forEach((group: FormFieldGroup) => {
      group.fields.forEach((field: FormField) => {
        field.control.setValue(t(data, field.name).safeObject);
      });
    });
  }

  private updateDataWithFormField(data: Record<string, any>, field: FormField) {
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

import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input,
  signal
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { IgoLanguageModule } from '@igo2/core/language';

import { IgoFormFieldComponent } from '../shared/form-field-component';
import { FormFieldSelectChoice } from '../shared/form.interfaces';
import {
  formControlIsRequired,
  getControlErrorMessage
} from '../shared/form.utils';

/**
 * This component renders a select field
 */
@IgoFormFieldComponent('select')
@Component({
  selector: 'igo-form-field-select',
  templateUrl: './form-field-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class FormFieldSelectComponent implements OnInit {
  readonly disabled = signal(false);

  /**
   * Select input choices
   */
  readonly choices = input.required<FormFieldSelectChoice[]>();

  /**
   * If the select allow multiple selections
   */
  readonly multiple = input(false);

  /**
   * The field's form control
   */
  readonly formControl = input<UntypedFormControl>(undefined);

  /**
   * Field placeholder
   */
  readonly placeholder = input<string>(undefined);

  /**
   * Field placeholder
   */
  readonly errors = input<Record<string, string>>(undefined);

  /**
   * Wheter a disable switch should be available
   */
  readonly disableSwitch = input(false);

  /**
   * Whether the field is required
   */
  get required(): boolean {
    return formControlIsRequired(this.formControl());
  }

  ngOnInit() {
    this.disabled.set(this.formControl().disabled);
  }

  /**
   * Get error message
   */
  getErrorMessage(): string {
    return getControlErrorMessage(this.formControl(), this.errors());
  }

  onDisableSwitchClick() {
    this.toggleDisabled();
  }

  private toggleDisabled() {
    const disabled = !this.disabled();
    if (disabled === true) {
      this.formControl().disable();
    } else {
      this.formControl().enable();
    }
    this.disabled.set(disabled);
  }
}

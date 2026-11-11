import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input,
  signal
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { IgoLanguageModule } from '@igo2/core/language';

import { IgoFormFieldComponent } from '../shared/form-field-component';
import {
  formControlIsRequired,
  getControlErrorMessage
} from '../shared/form.utils';

/**
 * This component renders a textarea field
 */
@IgoFormFieldComponent('textarea')
@Component({
  selector: 'igo-form-field-textarea',
  templateUrl: './form-field-textarea.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    IgoLanguageModule
  ]
})
export class FormFieldTextareaComponent implements OnInit {
  readonly disabled = signal(false);

  /**
   * The field's form control
   */
  readonly formControl = input.required<UntypedFormControl>();

  /**
   * Field showLabel
   */
  readonly showLabel = input<boolean>(false);

  /**
   * Field placeholder
   */
  readonly placeholder = input<string>();

  /**
   * Field placeholder
   */
  readonly errors = input<Record<string, string>>();

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
    return getControlErrorMessage(this.formControl(), this.errors() || {});
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

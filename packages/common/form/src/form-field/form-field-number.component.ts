import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  input,
  signal
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
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
 * This component renders a number field
 */
@IgoFormFieldComponent('number')
@Component({
  selector: 'igo-form-field-number',
  templateUrl: './form-field-number.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class FormFieldNumberComponent implements OnInit {
  private cdRef = inject(ChangeDetectorRef);

  readonly disabled = signal(false);
  hide = true;
  private lastTimeoutRequest?: number;

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

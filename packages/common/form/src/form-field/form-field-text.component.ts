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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { IgoLanguageModule } from '@igo2/core/language';

import { IgoFormFieldComponent } from '../shared/form-field-component';
import {
  formControlIsRequired,
  getControlErrorMessage
} from '../shared/form.utils';

/**
 * This component renders a text field
 */
@IgoFormFieldComponent('text')
@Component({
  selector: 'igo-form-field-text',
  templateUrl: './form-field-text.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class FormFieldTextComponent implements OnInit {
  private cdRef = inject(ChangeDetectorRef);

  readonly disabled = signal(false);
  hide = true;
  private lastTimeoutRequest?: number;

  /**
   * The field's form control
   */
  readonly formControl = input.required<UntypedFormControl>();

  /**
   * Field placeholder
   */
  readonly placeholder = input<string>();

  /**
   * if the input is a password
   */
  readonly isPassword = input<boolean>();

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

  togglePassword() {
    this.hide = !this.hide;
    this.delayedHide();
  }
  delayedHide(delayMS = 10000) {
    if (this.isPassword() && !this.hide) {
      if (this.lastTimeoutRequest) {
        clearTimeout(this.lastTimeoutRequest);
      }
      this.lastTimeoutRequest = window.setTimeout(() => {
        this.hide = true;
        this.cdRef.detectChanges();
      }, delayMS);
    }
  }
}

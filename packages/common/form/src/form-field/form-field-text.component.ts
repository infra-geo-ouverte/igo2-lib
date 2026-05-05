import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  input
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject } from 'rxjs';

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
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class FormFieldTextComponent implements OnInit {
  private cdRef = inject(ChangeDetectorRef);

  disabled$ = new BehaviorSubject<boolean>(false);
  hide = true;
  private lastTimeoutRequest;

  /**
   * The field's form control
   */
  readonly formControl = input<UntypedFormControl>(undefined);

  /**
   * Field placeholder
   */
  readonly placeholder = input<string>(undefined);

  /**
   * if the input is a password
   */
  readonly isPassword = input<boolean>(undefined);

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
    this.disabled$.next(this.formControl().disabled);
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
    const disabled = !this.disabled$.value;
    if (disabled === true) {
      this.formControl().disable();
    } else {
      this.formControl().enable();
    }
    this.disabled$.next(disabled);
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
      this.lastTimeoutRequest = setTimeout(() => {
        this.hide = true;
        this.cdRef.detectChanges();
      }, delayMS);
    }
  }
}

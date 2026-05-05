import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  input
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
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
    MatIconModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class FormFieldTextareaComponent implements OnInit {
  disabled$ = new BehaviorSubject<boolean>(false);

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
}

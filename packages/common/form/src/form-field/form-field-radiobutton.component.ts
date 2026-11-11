import {
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  signal
} from '@angular/core';
import {
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule
} from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';

import { IgoLanguageModule } from '@igo2/core/language';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IgoFormFieldComponent } from '../shared/form-field-component';
import type { FormFieldRadiobuttonInputs } from '../shared/form.interfaces';
import {
  formControlIsRequired,
  getControlErrorMessage
} from '../shared/form.utils';

@IgoFormFieldComponent('radiobuttons')
@IgoFormFieldComponent('radiobutton')
@Component({
  selector: 'igo-form-field-radiobutton',
  templateUrl: './form-field-radiobutton.component.html',
  styleUrl: './form-field-choice.component.scss',
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatRadioModule,
    IgoLanguageModule
  ]
})
export class FormFieldRadiobuttonComponent implements OnInit, OnDestroy {
  private errorStateMatcher = inject(ErrorStateMatcher);
  private parentForm = inject(NgForm, { optional: true });
  private parentFormGroup = inject(FormGroupDirective, { optional: true });

  readonly disabled = signal(false);
  private readonly showErrorState = signal(false);
  private destroy$ = new Subject<void>();

  readonly choices = input.required<FormFieldRadiobuttonInputs['choices']>();

  readonly formControl = input.required<UntypedFormControl>();

  readonly showLabel = input<boolean>(false);

  readonly placeholder = input<string>();

  readonly errors = input<Record<string, string>>();

  readonly disableSwitch = input(false);

  get required(): boolean {
    return formControlIsRequired(this.formControl());
  }

  ngOnInit() {
    const control = this.formControl();

    this.syncState(control);
    control.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.syncState(control);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getErrorMessage(): string {
    return getControlErrorMessage(this.formControl(), this.errors() || {});
  }

  showError(): boolean {
    return this.showErrorState();
  }

  onDisableSwitchClick() {
    this.toggleDisabled();
  }

  private syncState(control: UntypedFormControl) {
    this.disabled.set(control.disabled);
    this.showErrorState.set(
      this.errorStateMatcher.isErrorState(
        control,
        this.parentFormGroup ?? this.parentForm
      )
    );
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

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
  ReactiveFormsModule,
  ValidatorFn
} from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
import {
  MatCheckboxChange,
  MatCheckboxModule
} from '@angular/material/checkbox';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';

import { IgoLanguageModule } from '@igo2/core/language';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IgoFormFieldComponent } from '../shared/form-field-component';
import type { FormFieldCheckboxInputs } from '../shared/form.interfaces';
import {
  formControlIsRequired,
  getControlErrorMessage
} from '../shared/form.utils';

@IgoFormFieldComponent('checkbox')
@Component({
  selector: 'igo-form-field-checkbox',
  templateUrl: './form-field-checkbox.component.html',
  styleUrl: './form-field-choice.component.scss',
  imports: [
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    IgoLanguageModule
  ]
})
export class FormFieldCheckboxComponent implements OnInit, OnDestroy {
  private errorStateMatcher = inject(ErrorStateMatcher);
  private parentForm = inject(NgForm, { optional: true });
  private parentFormGroup = inject(FormGroupDirective, { optional: true });

  readonly disabled = signal(false);
  private readonly showErrorState = signal(false);
  private selectedValues = signal<unknown[]>([]);
  private destroy$ = new Subject<void>();

  readonly choices = input.required<FormFieldCheckboxInputs['choices']>();

  readonly formControl = input.required<UntypedFormControl>();

  readonly showLabel = input<boolean>(false);

  readonly placeholder = input<string>();

  readonly errors = input<Record<string, string>>();

  readonly maxSelected = input<number | undefined>();

  readonly disableSwitch = input(false);

  get required(): boolean {
    return formControlIsRequired(this.formControl());
  }

  ngOnInit() {
    const control = this.formControl();
    const maxSelected = this.maxSelected();

    if (typeof maxSelected === 'number' && Number.isFinite(maxSelected)) {
      control.addValidators(this.maxSelectedValidator(maxSelected));
    }

    const normalizedValue = this.normalizeValue(control.value);
    control.setValue(normalizedValue, {
      emitEvent: false
    });
    control.updateValueAndValidity({ emitEvent: false });
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
    const maxSelectedError = this.formControl().errors?.['maxSelected'] as
      { max: number; actual: number } | undefined;

    if (maxSelectedError) {
      return (
        this.errors()?.['maxSelected'] ||
        `Select at most ${maxSelectedError.max} options.`
      );
    }

    return getControlErrorMessage(this.formControl(), this.errors() || {});
  }

  showError(): boolean {
    return this.showErrorState();
  }

  isChecked(value: unknown): boolean {
    return this.selectedValues().some(
      (selectedValue) => selectedValue === value
    );
  }

  onChoiceChange(value: unknown, event: MatCheckboxChange) {
    const selectedValues = this.selectedValues();
    const nextValues = event.checked
      ? selectedValues.some((selectedValue) => selectedValue === value)
        ? selectedValues
        : [...selectedValues, value]
      : selectedValues.filter((selectedValue) => selectedValue !== value);

    this.formControl().setValue(nextValues);
    this.formControl().markAsDirty();
    this.formControl().markAsTouched();
  }

  onDisableSwitchClick() {
    this.toggleDisabled();
  }

  private normalizeValue(value: unknown): unknown[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (value === undefined || value === null || value === '') {
      return [];
    }

    return [value];
  }

  private syncState(control: UntypedFormControl) {
    this.disabled.set(control.disabled);
    this.selectedValues.set(this.normalizeValue(control.value));
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

  private maxSelectedValidator(maxSelected: number): ValidatorFn {
    return (control) => {
      const selectedValues = this.normalizeValue(control.value);

      if (selectedValues.length <= maxSelected) {
        return null;
      }

      return {
        maxSelected: {
          max: maxSelected,
          actual: selectedValues.length
        }
      };
    };
  }
}

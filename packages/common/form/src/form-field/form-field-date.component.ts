import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  input,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import type { UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import {
  DatepickerComponent,
  type DatepickerInputValue
} from '@igo2/common/datepicker';
import { IgoLanguageModule } from '@igo2/core/language';
import { TimeFrame } from '@igo2/utils';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IgoFormFieldComponent } from '../shared/form-field-component';
import {
  formControlIsRequired,
  getControlErrorMessage
} from '../shared/form.utils';

@IgoFormFieldComponent('date')
@Component({
  selector: 'igo-form-field-date',
  templateUrl: './form-field-date.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatepickerComponent,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class FormFieldDateComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  readonly disabled = signal(false);
  datepicker = viewChild.required<DatepickerComponent>('datepicker');
  private destroy$ = new Subject<void>();
  private syncingFromControl = false;

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
   * Field minDate
   */
  readonly minDate = input<Date | TimeFrame>();

  /**
   * Field maxDate
   */
  readonly maxDate = input<Date | TimeFrame>();

  /**
   * Calendar type (year, month, date, datetime)
   */
  readonly calendarType = input<'year' | 'month' | 'date' | 'datetime'>('date');

  /**
   * Initial view for the calendar
   */
  readonly startView = input<'multi-year' | 'year' | 'month'>();

  /**
   * Initial date to display in the calendar
   */
  readonly startAt = input<Date | TimeFrame>();

  /**
   * Filter function to disable certain dates
   */
  readonly datepickerFilter = input<(date: Date | null) => boolean>();

  /**
   * Today button label
   */
  readonly todayButtonLabel = input<string>('Today');

  /**
   * Clear button label
   */
  readonly clearButtonLabel = input<string>('Clear');

  /**
   * Error messages mapping
   */
  readonly errors = input<Record<string, string>>();

  /**
   * Whether a disable switch should be available
   */
  readonly disableSwitch = input(false);

  /**
   * Whether the field is required
   */
  get required(): boolean {
    return formControlIsRequired(this.formControl());
  }

  constructor() {}

  ngOnInit() {
    this.disabled.set(this.formControl().disabled);
  }

  ngAfterViewInit() {
    this.syncDatepickerFromControl(this.formControl().value);
    this.datepicker().disabled = this.formControl().disabled;

    this.datepicker().valueChange.subscribe((value) => {
      if (this.syncingFromControl) {
        return;
      }

      if (this.datepicker().hasSameValue(this.formControl().value, value)) {
        return;
      }

      this.formControl().setValue(
        this.datepicker().toControlValue(value) ?? null
      );
    });

    this.formControl()
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.syncDatepickerFromControl(value);
      });

    this.formControl()
      .statusChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const isDisabled = this.formControl().disabled;
        this.datepicker().disabled = isDisabled;
        this.disabled.set(isDisabled);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.datepicker().disabled = disabled;
    this.disabled.set(disabled);
  }

  private syncDatepickerFromControl(value: DatepickerInputValue) {
    this.syncingFromControl = true;

    this.datepicker().writeValue(value);
    this.syncingFromControl = false;
  }
}

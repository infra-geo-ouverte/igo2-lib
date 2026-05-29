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

import { DatepickerComponent } from '@igo2/common/datepicker';
import { IgoLanguageModule } from '@igo2/core/language';
import { TimeFrame, isIsoDate, isTimeFrame } from '@igo2/utils';

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

      if (this.areSameDateValues(this.formControl().value, value)) {
        return;
      }

      this.formControl().setValue(this.toControlValue(value) ?? null);
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

  private syncDatepickerFromControl(value: unknown) {
    this.syncingFromControl = true;

    const normalizedValue = this.normalizeDateValue(value);
    if (normalizedValue !== undefined) {
      this.datepicker().reset(normalizedValue);
    } else {
      this.datepicker().clearDate();
    }

    this.syncingFromControl = false;
  }

  private normalizeDateValue(value: unknown): Date | TimeFrame | undefined {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }

    if (typeof value === 'string') {
      if (isTimeFrame(value)) {
        return value;
      }

      const calendarDate = this.parseCalendarTypeValue(value);
      if (calendarDate) {
        return calendarDate;
      }

      if (isIsoDate(value)) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date;
      }
    }

    return undefined;
  }

  private areSameDateValues(left: unknown, right: unknown): boolean {
    const normalizedLeft = this.normalizeDateValue(left);
    const normalizedRight = this.normalizeDateValue(right);

    if (normalizedLeft === undefined && normalizedRight === undefined) {
      return true;
    }

    if (normalizedLeft instanceof Date && normalizedRight instanceof Date) {
      return normalizedLeft.getTime() === normalizedRight.getTime();
    }

    return normalizedLeft === normalizedRight;
  }

  private toControlValue(
    value: unknown
  ): Date | TimeFrame | string | undefined {
    const normalizedValue = this.normalizeDateValue(value);
    if (normalizedValue === undefined || isTimeFrame(normalizedValue)) {
      return normalizedValue;
    }

    switch (this.calendarType()) {
      case 'year':
        return this.formatYear(normalizedValue);
      case 'month':
        return this.formatMonth(normalizedValue);
      case 'date':
        return this.formatDate(normalizedValue);
      case 'datetime':
      default:
        return normalizedValue;
    }
  }

  private parseCalendarTypeValue(value: string): Date | undefined {
    const trimmedValue = value.trim();

    switch (this.calendarType()) {
      case 'year': {
        const match = trimmedValue.match(/^(\d{4})$/);
        if (!match) {
          return undefined;
        }
        return new Date(Number(match[1]), 0, 1);
      }
      case 'month': {
        const match = trimmedValue.match(/^(\d{4})-(\d{2})$/);
        if (!match) {
          return undefined;
        }
        return this.createLocalDate(match[1], match[2], '01');
      }
      case 'date': {
        const match = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) {
          return undefined;
        }
        return this.createLocalDate(match[1], match[2], match[3]);
      }
      case 'datetime':
      default:
        return undefined;
    }
  }

  private createLocalDate(
    yearValue: string,
    monthValue: string,
    dayValue: string
  ): Date | undefined {
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
      ? date
      : undefined;
  }

  private formatDate(date: Date): string {
    return [
      this.formatYear(date),
      this.padToTwoDigits(date.getMonth() + 1),
      this.padToTwoDigits(date.getDate())
    ].join('-');
  }

  private formatMonth(date: Date): string {
    return [
      this.formatYear(date),
      this.padToTwoDigits(date.getMonth() + 1)
    ].join('-');
  }

  private formatYear(date: Date): string {
    return date.getFullYear().toString();
  }

  private padToTwoDigits(value: number): string {
    return value.toString().padStart(2, '0');
  }
}

import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  effect,
  inject,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  MatCalendar,
  MatDatepicker,
  MatDatepickerModule
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { TimepickerComponent } from '@igo2/common/timepicker';
import { TimeFrame, isIsoDate, isTimeFrame, resolveDate } from '@igo2/utils';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type DatepickerInputValue =
  | Date
  | TimeFrame
  | string
  | number
  | null
  | undefined;

@Component({
  selector: 'igo-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    TimepickerComponent
  ],
  providers: [DatePipe, provideNativeDateAdapter()]
})
export class DatepickerComponent implements OnInit, AfterViewInit, OnDestroy {
  private datePipe = inject(DatePipe);
  private _locale = inject(LOCALE_ID);

  readonly picker = viewChild.required<MatDatepicker<Date>>('picker');
  readonly timepicker = viewChild<TimepickerComponent>('timepicker');

  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    this.setDisabledState();
  }
  get disabled(): boolean {
    return this._disabled;
  }
  private _disabled = false;

  readonly placeholder = input<string>('');
  readonly minDate = input<Date | TimeFrame>();
  readonly maxDate = input<Date | TimeFrame>();
  readonly calendarType = input<'year' | 'month' | 'date' | 'datetime'>('date');
  readonly startView = model<'multi-year' | 'year' | 'month'>();
  readonly startAt = input<Date | TimeFrame>();
  readonly datepickerFilter = input<(date: Date | null) => boolean>();
  readonly value = input<DatepickerInputValue>();
  readonly todayButtonLabel = input<string>('Today');
  readonly clearButtonLabel = input<string>('Clear');

  readonly valueChange = output<Date | TimeFrame | undefined>();

  get panelClassName(): string {
    return ['year', 'month'].includes(this.calendarType())
      ? 'igo-datepicker-month-year-picker'
      : '';
  }

  resolveDate = resolveDate;
  dateFormControl!: FormControl<Date | null | undefined>;
  dateLabelFormControl!: FormControl<string | null | undefined>;
  showActions = false;
  todaySelected = false;
  previousTodaySelected!: boolean;
  previousValue!: Date | TimeFrame | null | undefined;

  private destroy$ = new Subject<void>();
  private hasInitializedValueSync = false;

  constructor() {
    effect(() => {
      const value = this.value();
      if (!this.hasInitializedValueSync) {
        this.hasInitializedValueSync = true;
        return;
      }
      this.syncValueFromInput(value);
    });
  }

  ngOnInit(): void {
    this.initStartView();
    this.initFormControls();

    const value = this.normalizeValue(this.value());
    this.todaySelected = value ? isTimeFrame(value) : false;

    this.dateFormControl.valueChanges.subscribe((value) => {
      this.picker().startAt = value ? value : null;
      if (!this.todaySelected) {
        this.dateLabelFormControl.setValue(this.getFormattedLabel(value));
      }

      const emittedValue = this.todaySelected
        ? this.calendarType() === 'datetime'
          ? TimeFrame[0]
          : TimeFrame[1]
        : (value ?? undefined);
      this.valueChange.emit(emittedValue);
    });
  }

  ngAfterViewInit(): void {
    this.attachCalendarTypeListeners();
    this.picker()
      .openedStream.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.previousValue = this.dateFormControl.value;
        this.previousTodaySelected = this.todaySelected;
        this.todaySelected = false;
        this.registerAutoCloseEvents();
      });

    this.picker()
      .closedStream.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const value = this.normalizeValue(this.value());
        if (this.previousValue === this.dateFormControl.value) {
          this.todaySelected = this.previousTodaySelected;
        } else if (value && isTimeFrame(value)) {
          this.todaySelected = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setToday(): void {
    const keyword =
      this.calendarType() === 'datetime' ? TimeFrame[0] : TimeFrame[1];
    const date = resolveDate(keyword);
    if (!date) return;

    const picker = this.picker();
    picker.startAt = date;
    this.dateLabelFormControl.setValue(this.getFormattedLabel(keyword));
    this.todaySelected = true;
    this.dateFormControl.setValue(date);
    if (this.calendarType() === 'datetime') {
      this.timepicker()?.reset(date);
    }

    picker.close();
  }

  clearDate(): void {
    this.dateFormControl.reset();
    this.dateLabelFormControl.reset();
    if (this.calendarType() === 'datetime') {
      this.timepicker()?.clear();
    }
    this.picker().close();
  }

  updateTime(event: { hour: number; minute: number }): void {
    const currentValue = this.dateFormControl.value ?? new Date();
    const nextDate = new Date(currentValue);
    nextDate.setHours(event.hour, event.minute, 0, 0);

    this.todaySelected = false;
    this.dateFormControl.setValue(nextDate);
  }

  writeValue(value: DatepickerInputValue): void {
    this.syncValueFromInput(value);
  }

  hasSameValue(
    left: DatepickerInputValue,
    right: DatepickerInputValue
  ): boolean {
    const normalizedLeft = this.normalizeValue(left);
    const normalizedRight = this.normalizeValue(right);

    if (normalizedLeft === undefined && normalizedRight === undefined) {
      return true;
    }

    if (normalizedLeft instanceof Date && normalizedRight instanceof Date) {
      return normalizedLeft.getTime() === normalizedRight.getTime();
    }

    return normalizedLeft === normalizedRight;
  }

  toControlValue(
    value: DatepickerInputValue
  ): Date | TimeFrame | string | undefined {
    const normalizedValue = this.normalizeValue(value);
    if (normalizedValue === undefined || isTimeFrame(normalizedValue)) {
      return normalizedValue;
    }

    switch (this.calendarType()) {
      case 'year':
        return this.formatYear(normalizedValue);
      case 'month':
        return this.formatMonth(normalizedValue);
      case 'date':
        return this.formatDateValue(normalizedValue);
      case 'datetime':
      default:
        return normalizedValue;
    }
  }

  normalizeValue(value: DatepickerInputValue): Date | TimeFrame | undefined {
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

  get timepickerValue(): Date | TimeFrame | undefined {
    if (this.todaySelected) {
      return this.calendarType() === 'datetime' ? TimeFrame[0] : TimeFrame[1];
    }

    return this.dateFormControl?.value ?? this.normalizeValue(this.value());
  }

  private registerAutoCloseEvents(): void {
    const maxDate = this.maxDate();
    const resolvedMaxDate = maxDate ? resolveDate(maxDate) : undefined;

    this.showActions =
      (!resolvedMaxDate || resolvedMaxDate >= new Date()) &&
      ['date', 'datetime'].includes(this.calendarType());

    if (this.showActions) {
      // Workaround, we need the next event queue to get the calendar
      setTimeout(() => {
        const calendar: MatCalendar<Date> =
          this.picker()['_componentRef'].instance._calendar;
        calendar?._userSelection.subscribe((event) => {
          this.dateFormControl.setValue(event.value);
          this.picker().close();
        });
      }, 0);
    }
  }

  /** Public API methods */
  reset(date: Date | TimeFrame) {
    this.todaySelected = isTimeFrame(date);
    this.dateLabelFormControl.setValue(this.getFormattedLabel(date));
    this.dateFormControl.setValue(resolveDate(date));
  }

  handleDateLabelBlur(): void {
    const value = this.dateLabelFormControl.value;
    const parsedDate = this.parseInput(value);
    if (!parsedDate) return;
    this.dateFormControl.setValue(parsedDate);
  }

  private parseInput(value: string | null | undefined): Date | undefined {
    if (!value) return undefined;
    switch (this.calendarType()) {
      case 'year':
        return this.parseYearInput(value);
      case 'month':
        return this.parseMonthInput(value);
      default:
        return this.parseDateInput(value);
    }
  }

  private parseYearInput(value: string): Date | undefined {
    // Accept "yyyy"
    const match = value.match(/^\s*(\d{4})\s*$/);
    if (!match) return undefined;
    const year = +match[1];
    const date = new Date(year, 0, 1);
    return date.getFullYear() === year ? date : undefined;
  }

  private parseMonthInput(value: string): Date | undefined {
    return this.parseFromLocalizedInput(value, {
      year: 'numeric',
      month: '2-digit'
    });
  }

  private parseDateInput(value: string): Date | undefined {
    return this.parseFromLocalizedInput(value, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  private initStartView(): void {
    if (this.startView()) return;
    switch (this.calendarType()) {
      case 'year':
        this.startView.set('multi-year');
        break;
      case 'month':
        this.startView.set('year');
        break;
      case 'date':
      case 'datetime':
      default:
        this.startView.set('month');
        break;
    }
  }

  private initFormControls() {
    const date = this.normalizeValue(this.value()) ?? new Date();
    this.dateFormControl = new FormControl({
      value: resolveDate(date),
      disabled: this.disabled
    });

    this.dateLabelFormControl = new FormControl({
      value: this.getFormattedLabel(date),
      disabled: this.disabled
    });
  }

  private syncValueFromInput(value: DatepickerInputValue): void {
    if (!this.dateFormControl || !this.dateLabelFormControl) {
      return;
    }

    const normalizedValue = this.normalizeValue(value);

    const nextTodaySelected = normalizedValue
      ? isTimeFrame(normalizedValue)
      : false;
    const nextDateValue = normalizedValue ? resolveDate(normalizedValue) : null;
    const nextLabel = this.getFormattedLabel(normalizedValue);

    const currentDateValue = this.dateFormControl.value ?? null;
    const hasSameDateValue =
      (!currentDateValue && !nextDateValue) ||
      (!!currentDateValue &&
        !!nextDateValue &&
        currentDateValue.getTime() === nextDateValue.getTime());
    const hasSameLabel = this.dateLabelFormControl.value === nextLabel;
    const hasSameTodaySelected = this.todaySelected === nextTodaySelected;

    if (hasSameDateValue && hasSameLabel && hasSameTodaySelected) {
      return;
    }

    this.todaySelected = nextTodaySelected;

    this.dateFormControl.setValue(nextDateValue, {
      emitEvent: false
    });
    this.dateLabelFormControl.setValue(nextLabel, {
      emitEvent: false
    });

    if (this.calendarType() === 'datetime') {
      if (normalizedValue) {
        this.timepicker()?.reset(normalizedValue);
      } else {
        this.timepicker()?.clear();
      }
    }
  }

  private setDisabledState(): void {
    const method = this.disabled ? 'disable' : 'enable';
    this.dateFormControl?.[method]({ emitEvent: false });
    this.dateLabelFormControl?.[method]({ emitEvent: false });
  }

  private attachCalendarTypeListeners(): void {
    const calendarType = this.calendarType();
    if (calendarType === 'year') {
      this.picker().yearSelected.subscribe((date) => {
        this.updateDateControl(date);
        this.picker().close();
      });
    } else if (calendarType === 'month') {
      this.picker().monthSelected.subscribe((date) => {
        this.updateDateControl(date);
        this.picker().close();
      });
    }
  }

  private updateDateControl(date: Date | null | undefined) {
    if (date && this.calendarType() === 'datetime') {
      const currentValue = this.dateFormControl.value;
      if (currentValue) {
        const nextDate = new Date(date);
        nextDate.setHours(
          currentValue.getHours(),
          currentValue.getMinutes(),
          0,
          0
        );
        this.dateFormControl.setValue(nextDate);
        return;
      }
    }

    this.dateFormControl.setValue(date);
  }

  private getFormattedLabel(
    date: Date | TimeFrame | null | undefined
  ): string | null {
    if (!date) return null;
    if (isTimeFrame(date)) return this.todayButtonLabel();
    const calendarType = this.calendarType();
    if (calendarType === 'year') {
      return this.format(date as Date, 'yyyy');
    } else if (calendarType === 'month') {
      return this.formatYearMonth(date as Date);
    } else if (calendarType === 'datetime') {
      return this.format(date as Date, 'short');
    }
    return this.format(date as Date, 'shortDate');
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
      case 'datetime': {
        const match = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) {
          return undefined;
        }
        return this.createLocalDate(match[1], match[2], match[3]);
      }
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

  private formatDateValue(date: Date): string {
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

  private format(date: Date, formatStr: string): string {
    return (
      this.datePipe.transform(date, formatStr, undefined, this._locale) ?? ''
    );
  }

  private formatYearMonth(date: Date): string {
    return new Intl.DateTimeFormat(this._locale, {
      year: 'numeric',
      month: '2-digit'
    }).format(date);
  }

  private parseFromLocalizedInput(
    value: string,
    formatOptions: Intl.DateTimeFormatOptions
  ): Date | undefined {
    const expectedOrder = this.getExpectedDateOrder(formatOptions);
    const inputParts = value.trim().match(/\d+/g);
    if (!inputParts || inputParts.length !== expectedOrder.length)
      return undefined;

    let year: number | undefined;
    let month: number | undefined;
    let day: number | undefined;

    expectedOrder.forEach((type, i) => {
      const num = Number(inputParts[i]);
      if (type === 'year') year = num;
      else if (type === 'month') month = num;
      else if (type === 'day') day = num;
    });

    // Basic range checks
    if (!year || !month || month < 1 || month > 12) return undefined;
    const date = new Date(year, month - 1, day !== undefined ? day : 1);
    const isValid =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      day !== undefined
        ? date.getDate() === day
        : true;
    return isValid ? date : undefined;
  }

  /**
   * Returns the expected order of date parts (year, month, day) as used by
   * Intl.DateTimeFormat.formatToParts for the provided options and current locale.
   */
  private getExpectedDateOrder(
    formatOptions: Intl.DateTimeFormatOptions
  ): ('year' | 'month' | 'day')[] {
    const sampleDate = new Date(2001, 1, 3);
    const formatter = new Intl.DateTimeFormat(this._locale, formatOptions);
    const formatParts = formatter.formatToParts(sampleDate);
    // Extract expected order from locale formatting
    const expectedOrder: ('year' | 'month' | 'day')[] = [];
    formatParts.forEach((part) => {
      if (
        part.type === 'year' ||
        part.type === 'month' ||
        part.type === 'day'
      ) {
        expectedOrder.push(part.type);
      }
    });
    return expectedOrder;
  }
}

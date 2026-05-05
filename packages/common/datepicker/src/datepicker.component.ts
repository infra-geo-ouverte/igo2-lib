import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
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

import { TimeFrame, isTimeFrame, resolveDate } from '@igo2/utils';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    MatDatepickerModule
  ],
  providers: [DatePipe, provideNativeDateAdapter()]
})
export class DatepickerComponent implements OnInit, AfterViewInit, OnDestroy {
  private datePipe = inject(DatePipe);
  private _locale = inject(LOCALE_ID);

  readonly picker = viewChild.required<MatDatepicker<Date>>('picker');

  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    this.setDisabledState();
  }
  get disabled(): boolean {
    return this._disabled;
  }
  private _disabled = false;

  readonly placeholder = input<string>(undefined);
  readonly minDate = input<Date | TimeFrame>(undefined);
  readonly maxDate = input<Date | TimeFrame>(undefined);
  readonly calendarType = input<'year' | 'month' | 'date' | 'datetime'>('date');
  readonly startView = model<'multi-year' | 'year' | 'month'>(undefined);
  readonly startAt = input<Date | TimeFrame>(undefined);
  readonly datepickerFilter = input<(date: Date | null) => boolean>(undefined);
  readonly value = input<Date | TimeFrame>(undefined);
  readonly todayButtonLabel = input<string>('Today');
  readonly clearButtonLabel = input<string>('Clear');

  readonly valueChange = output<Date | TimeFrame>();

  get panelClassName(): string {
    return ['year', 'month'].includes(this.calendarType())
      ? 'igo-datepicker-month-year-picker'
      : '';
  }

  resolveDate = resolveDate;
  dateFormControl!: FormControl<Date>;
  dateLabelFormControl!: FormControl<string>;
  showActions = false;
  todaySelected = false;
  previousTodaySelected: boolean;
  previousValue: Date | TimeFrame;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initStartView();
    this.initFormControls();

    this.todaySelected = isTimeFrame(this.value());

    this.dateFormControl.valueChanges.subscribe((value) => {
      this.picker().startAt = value;
      if (!this.todaySelected) {
        this.dateLabelFormControl.setValue(this.getFormattedLabel(value));
      }

      const emittedValue = this.todaySelected
        ? this.calendarType() === 'datetime'
          ? TimeFrame[0]
          : TimeFrame[1]
        : value;
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
        if (this.previousValue === this.dateFormControl.value) {
          this.todaySelected = this.previousTodaySelected;
        } else if (isTimeFrame(this.value())) {
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
    const picker = this.picker();
    const date = (picker.startAt = resolveDate(keyword));
    this.dateLabelFormControl.setValue(this.getFormattedLabel(keyword));
    this.todaySelected = true;
    this.updateDateControl(date);

    picker.close();
  }

  clearDate(): void {
    this.dateFormControl.reset();
    this.dateLabelFormControl.reset();
    this.picker().close();
  }

  private registerAutoCloseEvents(): void {
    const resolvedMaxDate = resolveDate(this.maxDate());

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

  private parseInput(value: string): Date | undefined {
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
    const date = this.value() ?? new Date();
    this.dateFormControl = new FormControl({
      value: resolveDate(date),
      disabled: this.disabled
    });

    this.dateLabelFormControl = new FormControl({
      value: this.getFormattedLabel(date),
      disabled: this.disabled
    });
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

  private updateDateControl(date: Date) {
    this.dateFormControl.setValue(date);
  }

  private getFormattedLabel(date: Date | TimeFrame): string {
    if (isTimeFrame(date)) return this.todayButtonLabel();
    const calendarType = this.calendarType();
    if (calendarType === 'year') {
      return this.format(date as Date, 'yyyy');
    } else if (calendarType === 'month') {
      return this.formatYearMonth(date as Date);
    }
    return this.format(date as Date, 'shortDate');
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

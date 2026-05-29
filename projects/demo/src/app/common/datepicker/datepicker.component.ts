import { AsyncPipe, formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DatepickerComponent } from '@igo2/common/datepicker';
import { TimeFrame } from '@igo2/utils';

import { BehaviorSubject } from 'rxjs';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

type CalendarType = 'year' | 'month' | 'date' | 'datetime';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatSlideToggleModule,
    DatepickerComponent,
    DocViewerComponent,
    ExampleViewerComponent
  ]
})
export class AppDatepickerComponent {
  readonly today = TimeFrame[1];
  readonly now = TimeFrame[0];

  readonly emittedValue$ = new BehaviorSubject<Date | TimeFrame | undefined>(
    undefined
  );
  lastEmittedCalendarType: CalendarType = 'datetime';

  disabled = false;

  readonly defaultDate = new Date(2026, 4, 29);
  readonly monthDate = new Date(2026, 7, 1);
  readonly yearDate = new Date(2028, 0, 1);
  readonly dateTimeValue = new Date(2026, 4, 29, 14, 30);
  readonly boundedDate = new Date(2026, 5, 15);
  readonly startAtDate = new Date(2027, 0, 10);
  readonly minDate = new Date(2026, 4, 10);
  readonly maxDate = new Date(2026, 5, 20);

  readonly exampleConfigs: {
    title: string;
    description: string;
    placeholder: string;
    calendarType?: CalendarType;
    value?: Date | TimeFrame;
    startView?: 'multi-year' | 'year' | 'month';
    startAt?: Date;
    minDate?: Date;
    maxDate?: Date;
    datepickerFilter?: (date: Date | null) => boolean;
    todayButtonLabel?: string;
    clearButtonLabel?: string;
    disabled?: boolean;
  }[] = [
    {
      title: 'Default date mode',
      description:
        'Full date mode with an initial value and Today / Clear actions.',
      placeholder: 'Select a date',
      calendarType: 'date',
      value: this.defaultDate
    },
    {
      title: 'Month mode',
      description: 'Month selection with an initial year view.',
      placeholder: 'Select a month',
      calendarType: 'month',
      value: this.monthDate,
      startView: 'year'
    },
    {
      title: 'Year mode',
      description: 'Year selection with a multi-year view.',
      placeholder: 'Select a year',
      calendarType: 'year',
      value: this.yearDate,
      startView: 'multi-year'
    },
    {
      title: 'Datetime mode with now',
      description: 'Datetime mode can emit the relative value now.',
      placeholder: 'Select a date and keep time',
      calendarType: 'datetime',
      value: this.now,
      todayButtonLabel: 'Now',
      clearButtonLabel: 'Reset'
    },
    {
      title: 'Min / max / startAt',
      description: 'Minimum, maximum, startAt, and weekday-only filtering.',
      placeholder: 'Business day only',
      calendarType: 'date',
      value: this.boundedDate,
      startAt: this.startAtDate,
      minDate: this.minDate,
      maxDate: this.maxDate,
      datepickerFilter: (date) => this.allowWeekdaysOnly(date)
    },
    {
      title: 'Relative today value',
      description: 'Example of a dynamic today value.',
      placeholder: 'Always today',
      calendarType: 'date',
      value: this.today,
      todayButtonLabel: 'Use today',
      clearButtonLabel: 'Clear value'
    },
    {
      title: 'Disabled from input',
      description: 'The component can also be disabled through its input.',
      placeholder: 'Disabled datepicker',
      calendarType: 'date',
      value: this.defaultDate,
      disabled: true
    }
  ];

  readonly playgroundValue$ = new BehaviorSubject<Date | TimeFrame | undefined>(
    this.defaultDate
  );

  onPlaygroundValueChange(value: Date | TimeFrame): void {
    this.setPlaygroundValue(value, 'datetime');
  }

  onExampleValueChange(
    value: Date | TimeFrame,
    calendarType: CalendarType
  ): void {
    this.lastEmittedCalendarType = calendarType;
    this.emittedValue$.next(value);
  }

  toggleDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  setToday(): void {
    this.setPlaygroundValue(this.today, 'datetime');
  }

  setNow(): void {
    this.setPlaygroundValue(this.now, 'datetime');
  }

  setSpecificDate(): void {
    this.setPlaygroundValue(new Date(2026, 9, 6, 9, 45), 'datetime');
  }

  clearPlayground(): void {
    this.setPlaygroundValue(undefined, 'datetime');
  }

  private allowWeekdaysOnly(date: Date | null): boolean {
    if (!date) {
      return false;
    }

    const day = date.getDay();
    return day !== 0 && day !== 6;
  }

  formatEmittedValue(
    value: Date | TimeFrame | undefined,
    calendarType: CalendarType
  ): string {
    if (value === undefined) {
      return 'undefined';
    }

    if (typeof value === 'string') {
      return value;
    }

    switch (calendarType) {
      case 'year':
        return formatDate(value, 'yyyy', 'en-CA');
      case 'month':
        return formatDate(value, 'yyyy-MM', 'en-CA');
      case 'date':
        return formatDate(value, 'yyyy-MM-dd', 'en-CA');
      case 'datetime':
      default:
        return formatDate(value, 'yyyy-MM-dd HH:mm', 'en-CA');
    }
  }

  private setPlaygroundValue(
    value: Date | TimeFrame | undefined,
    calendarType: CalendarType
  ): void {
    this.lastEmittedCalendarType = calendarType;
    this.playgroundValue$.next(value);
    this.emittedValue$.next(value);
  }
}

import {
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DatepickerComponent } from '@igo2/common/datepicker';
import { TimepickerComponent } from '@igo2/common/timepicker';
import { IgoLanguageModule } from '@igo2/core/language';
import { TimeFrame, isTimeFrame, resolveDate } from '@igo2/utils';

import { default as moment } from 'moment';

import { OgcFilterOperator } from '../../filter/shared/ogc-filter.enum';
import { OGCFilterTimeService } from '../shared/ogc-filter-time.service';
import {
  OgcFilterDuringOptions,
  OgcFilterableDataSource,
  OgcFilterableDataSourceOptions
} from '../shared/ogc-filter.interface';
import { OgcFilterTimeSliderComponent } from './ogc-filter-time-slider.component';

@Component({
  selector: 'igo-ogc-filter-time',
  templateUrl: './ogc-filter-time.component.html',
  styleUrls: ['./ogc-filter-time.component.scss'],
  imports: [
    MatSlideToggleModule,
    FormsModule,
    OgcFilterTimeSliderComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatSelectModule,
    ReactiveFormsModule,
    DatepickerComponent,
    TimepickerComponent,
    MatOptionModule,
    IgoLanguageModule
  ],
  providers: [OGCFilterTimeService]
})
export class OgcFilterTimeComponent implements OnInit {
  ogcFilterTimeService = inject(OGCFilterTimeService);

  readonly datasource = input<OgcFilterableDataSource>(undefined);
  readonly currentFilter = input<any>(undefined);
  readonly changeProperty = output<any>();

  readonly _defaultMin: string = '1900-01-01';
  readonly _defaultMax: string = '2052-01-06';
  readonly _defaultDisplayFormat: string = 'DD/MM/YYYY HH:mm A';
  readonly _defaultSliderModeEnabled: boolean = true;
  ogcFilterOperator = OgcFilterOperator;
  sliderMode = signal(false);

  readonly defaultStepMillisecond = 60000;
  options: OgcFilterableDataSourceOptions;

  onlyYearBegin: number;
  onlyYearEnd: number;
  calendarTypeYear = false;
  resetIcon = 'replay';
  filterStateDisable: boolean;

  readonly beginDatepicker = viewChild<DatepickerComponent>('beginDatepicker');
  readonly endDatepicker = viewChild<DatepickerComponent>('endDatepicker');

  readonly beginTime = viewChild<TimepickerComponent>('beginTimepicker');
  readonly endTime = viewChild<TimepickerComponent>('endTimepicker');

  private filterOriginConfig: OgcFilterDuringOptions;

  get step(): string {
    const datasource = this.datasource();
    return datasource.options.stepDate
      ? datasource.options.stepDate
      : this.currentFilter().step;
  }

  get stepMilliseconds(): number {
    const step = moment.duration(this.step).asMilliseconds();
    return step === 0 ? this.defaultStepMillisecond : step;
  }

  beginValue: Date | TimeFrame;
  endValue: Date | TimeFrame;

  get sliderInterval(): number {
    const currentFilter = this.currentFilter();
    return currentFilter.sliderInterval === undefined
      ? 2000
      : currentFilter.sliderInterval;
  }

  get maxDate(): string {
    const datasource = this.datasource();
    return datasource.options.maxDate
      ? datasource.options.maxDate
      : this._defaultMax;
  }

  get displayFormat(): string {
    const currentFilter = this.currentFilter();
    return currentFilter.displayFormat
      ? currentFilter.displayFormat
      : this._defaultDisplayFormat;
  }

  filterBeginFunction;
  filterEndFunction;

  resolveDate = resolveDate;

  ngOnInit(): void {
    this.filterOriginConfig = this.datasource().options.ogcFilters
      .filters as OgcFilterDuringOptions;
    const currentFilter = this.currentFilter();
    if (currentFilter.sliderOptions) {
      currentFilter.sliderOptions.enabled =
        currentFilter.sliderOptions.enabled !== undefined
          ? currentFilter.sliderOptions.enabled
          : this._defaultSliderModeEnabled;
    }

    this.initDateValues();

    this.calendarTypeYear = this.isCalendarYearMode();
    this.setFilterStateDisable();

    this.dateFilter(this.filterBeginFunction, 'begin');
    this.dateFilter(this.filterEndFunction, 'end');
  }

  changeTemporalProperty(
    value: Date | TimeFrame,
    position: number,
    refreshFilter = true
  ) {
    if (isTimeFrame(value)) {
      this.changeProperty.emit({
        value: value.toString(),
        pos: position,
        refreshFilter
      });
      if (position === 1) {
        this.beginValue = value;
      } else {
        this.endValue = value;
      }
      return;
    }
    value = resolveDate(value);
    let valueTmp = this.getDateTime(value, position);
    if (this.isCalendarYearMode()) {
      let dateStringFromYearNotime;
      if (position === 1) {
        this.beginValue = value;
        this.onlyYearBegin = this.beginValue.getFullYear();
        dateStringFromYearNotime = `${this.onlyYearBegin}-01-01`;
      } else {
        this.endValue = value;
        this.onlyYearEnd = this.endValue.getFullYear();
        dateStringFromYearNotime = `${this.onlyYearEnd}-12-31`;
      }
      // call service with string date without time
      this.changeProperty.emit({
        value: dateStringFromYearNotime,
        pos: position,
        refreshFilter
      });
      return;
    }

    if (
      position === 2 &&
      this.calendarType() === 'date' &&
      !this.sliderMode()
    ) {
      valueTmp = moment(valueTmp).endOf('day').toDate();
    }

    if (position === 1) {
      this.beginValue = valueTmp;
      if (this.restrictedToStep()) {
        this.changeTemporalProperty(
          this.ogcFilterTimeService.addStep(valueTmp, this.stepMilliseconds),
          2,
          refreshFilter
        );
      }
    } else {
      this.endValue = valueTmp;
    }
    this.changeProperty.emit({
      value: valueTmp.toISOString(),
      pos: position,
      refreshFilter
    });
  }

  handleDate(value: string): Date {
    if (!value || value === '') {
      return undefined;
    }
    if (typeof value === 'string' && this.currentFilter().calendarModeYear) {
      return this.getDateFromStringWithoutTime(value);
    }
    return new Date(value);
  }

  calendarType(): 'year' | 'month' | 'date' | 'datetime' {
    if (
      this.currentFilter().calendarModeYear ||
      this.ogcFilterTimeService.stepIsYearDuration(this.step)
    ) {
      return 'year';
    }
    if (this.stepMilliseconds < 86400000) {
      return 'datetime';
    }
    if (this.ogcFilterTimeService.stepIsMonthDuration(this.step)) {
      return 'month';
    }
    return 'date';
  }

  yearSelected(
    year: Date | TimeFrame,
    property?: string,
    refreshFilter = true
  ) {
    if (!this.ogcFilterTimeService.stepIsYearDuration(this.step)) return;
    if (!isTimeFrame(year)) {
      if (property === 'end') {
        // change value 01 jan to 31 dec same year
        year = moment(year).endOf('year').toDate();
      } else if (
        property === 'begin' &&
        this.restrictedToStep() &&
        !this.calendarTypeYear
      ) {
        this.yearSelected(year, 'end');
      }
    }
    this.changeTemporalProperty(
      year,
      property === 'begin' ? 1 : 2,
      refreshFilter
    );
  }

  monthSelected(
    month: Date | TimeFrame,
    property?: 'begin' | 'end',
    refreshFilter = true
  ): void {
    if (!this.ogcFilterTimeService.stepIsMonthDuration(this.step)) return;
    if (!isTimeFrame(month)) {
      if (property === 'end') {
        month = moment(month).endOf('month').toDate();
      } else if (property === 'begin' && this.restrictedToStep()) {
        this.monthSelected(month, 'end');
      }
    }

    this.changeTemporalProperty(
      month,
      property === 'begin' ? 1 : 2,
      refreshFilter
    );
  }

  calendarView() {
    if (this.ogcFilterTimeService.stepIsYearDuration(this.step)) {
      return 'multi-year';
    } else if (this.ogcFilterTimeService.stepIsMonthDuration(this.step)) {
      return 'year';
    } else {
      return 'month';
    }
  }

  changePropertyByPass(event) {
    this.changeProperty.emit(event);
  }

  modeChange(event) {
    if (!event.checked) {
      this.updateValues();
    }
  }

  resetFilter() {
    const minDefaultDate = this.parseDateToComparable(
      this.filterOriginConfig.begin
    );
    const maxDefaultDate = this.parseDateToComparable(
      this.filterOriginConfig.end
    );

    const currentBegin = this.parseDateToComparable(this.currentFilter().begin);
    const currentEnd = this.parseDateToComparable(this.currentFilter().end);

    const shouldReset =
      currentBegin !== minDefaultDate || currentEnd !== maxDefaultDate;
    if (shouldReset) {
      this.beginValue = isTimeFrame(minDefaultDate)
        ? minDefaultDate
        : new Date(minDefaultDate);
      this.endValue = isTimeFrame(maxDefaultDate)
        ? maxDefaultDate
        : new Date(maxDefaultDate);
      this.beginDatepicker().reset(this.beginValue);
      this.endDatepicker()?.reset(this.endValue);
      if (this.calendarType() === 'datetime') {
        this.beginTime()?.reset(this.beginValue);
        this.endTime()?.reset(this.endValue);
      }
      this.updateValues();
    }
  }

  toggleFilterState() {
    if (this.currentFilter().active === true) {
      this.currentFilter().active = false;
    } else {
      this.currentFilter().active = true;
    }
    this.setFilterStateDisable();
    this.updateValues();
  }

  sameDate() {
    if (!this.beginValue || !this.endValue) return false;
    return moment(resolveDate(this.beginValue)).isSame(
      resolveDate(this.endValue),
      'day'
    );
  }

  updateTime(event: { hour: number; minute: number }, position: number) {
    let date = position === 1 ? this.beginValue : this.endValue;
    if (!isTimeFrame(date)) {
      date = new Date(
        resolveDate(date).setHours(event.hour, event.minute, 0, 0)
      );
    }
    this.changeTemporalProperty(date, position);
  }

  dateNotTimeFrame(
    value: Date | TimeFrame | undefined,
    fallbackDate: string
  ): boolean {
    return !isTimeFrame(value ?? this.handleDate(fallbackDate));
  }

  restrictedToStep(): boolean {
    return this.currentFilter().restrictToStep
      ? this.currentFilter().restrictToStep
      : false;
  }

  private isCalendarYearMode(): boolean {
    if (this.calendarType() === 'year') {
      return true;
    } else {
      return false;
    }
  }

  private initDateValues(): void {
    if (isTimeFrame(this.handleMin())) {
      this.beginValue = this.handleMin();
    } else {
      this.beginValue = this.parseFilter(this.handleMin());
    }

    if (isTimeFrame(this.handleMax())) {
      this.endValue = this.handleMax();
    } else {
      this.endValue = this.parseFilter(this.handleMax());
    }

    this.onlyYearBegin = resolveDate(this.beginValue).getUTCFullYear();
    this.onlyYearEnd = resolveDate(this.endValue).getUTCFullYear();
  }

  private parseFilter(filter): Date {
    if (!filter) {
      return new Date();
    } else if (isNaN(new Date(filter).getTime())) {
      if (filter.search('now') >= 0) {
        const interval = filter.match(/years|months|weeks|days|hours|seconds/);
        if (filter.match(/\+/)) {
          const intervalInt = parseInt(
            filter.substring(filter.indexOf('+') + 1, interval.index),
            10
          );
          return moment().add(intervalInt, interval[0]).toDate();
        }
        if (filter.match(/\-/)) {
          const intervalInt = parseInt(
            filter.substring(filter.indexOf('-') + 1, interval.index),
            10
          );
          return moment().subtract(intervalInt, interval[0]).toDate();
        }
        return new Date();
      }
      if (filter.search('today') >= 0) {
        const _now = moment().endOf('day').toDate();
        const interval = filter.match(/years|months|weeks|days|hours|seconds/);
        if (filter.match(/\+/)) {
          const intervalInt = parseInt(
            filter.substring(filter.indexOf('+') + 1, interval.index),
            10
          );
          return moment(_now).add(intervalInt, interval[0]).toDate();
        }
        if (filter.match(/\-/)) {
          const intervalInt = parseInt(
            filter.substring(filter.indexOf('-') + 1, interval.index),
            10
          );
          return moment(_now).subtract(intervalInt, interval[0]).toDate();
        }
        return _now;
      }
      return new Date();
    }
    if (this.currentFilter().calendarModeYear) {
      const date = this.getDateFromStringWithoutTime(filter);
      return date;
    } else {
      return filter ? new Date(filter) : new Date();
    }
  }

  private dateFilter(type: string, date: string) {
    const dateValue = new Date(date);
    const diff = dateValue.getTime() - new Date(this.handleMin()).getTime();

    if (this.ogcFilterTimeService.stepIsYearDuration(this.step)) {
      const monthDiff = moment(dateValue).diff(
        moment(this.handleMin()),
        'years',
        true
      );
      if (type === 'end') {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const monthDiffPlus1 = moment(dateValuePlus1).diff(
          moment(this.handleMin()),
          'years',
          true
        );
        this.filterEndFunction =
          monthDiffPlus1 % moment.duration(this.step).asYears() === 0;
        return;
      } else if (type === 'begin') {
        this.filterBeginFunction =
          monthDiff % moment.duration(this.step).asYears() === 0;
        return;
      }
    } else if (this.ogcFilterTimeService.stepIsMonthDuration(this.step)) {
      const monthDiff = moment(dateValue).diff(
        moment(this.handleMin()),
        'months',
        true
      );
      if (type === 'end') {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const monthDiffPlus1 = moment(dateValuePlus1).diff(
          moment(this.handleMin()),
          'months',
          true
        );
        this.filterEndFunction =
          monthDiffPlus1 % moment.duration(this.step).asMonths() === 0;
        return;
      } else if (type === 'begin') {
        this.filterBeginFunction =
          monthDiff % moment.duration(this.step).asMonths() === 0;
        return;
      }
    } else if (this.ogcFilterTimeService.stepIsWeekDuration(this.step)) {
      const weekDiff = moment(dateValue).diff(
        moment(this.handleMin()),
        'weeks',
        true
      );
      if (type === 'end') {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const weekDiffPlus1 = moment(dateValuePlus1).diff(
          moment(this.handleMin()),
          'weeks',
          true
        );
        this.filterEndFunction =
          weekDiffPlus1 % moment.duration(this.step).asWeeks() === 0;
        return;
      } else if (type === 'begin') {
        this.filterBeginFunction =
          weekDiff % moment.duration(this.step).asWeeks() === 0;
        return;
      }
    } else if (this.ogcFilterTimeService.stepIsDayDuration(this.step)) {
      const dayDiff = moment(dateValue).diff(
        moment(this.handleMin()),
        'days',
        true
      );
      if (type === 'end') {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const dayDiffPlus1 = moment(dateValuePlus1).diff(
          moment(this.handleMin()),
          'days',
          true
        );
        const _mod = dayDiffPlus1 % moment.duration(this.step).asDays();
        this.filterEndFunction =
          (_mod < 0.0000001 && _mod > -0.0000001) || _mod === 0; // 1 millisecond = 1.1574074074074076e-8
        return;
      } else if (type === 'begin') {
        const _mod = (dayDiff % moment.duration(this.step).asDays()) + 1;
        this.filterBeginFunction =
          (_mod < 0.0000001 && _mod > -0.0000001 && _mod !== 0) || _mod === 1; // 1 millisecond = 1.1574074074074076e-8
        return;
      }
    } else if (this.ogcFilterTimeService.stepIsHourDuration(this.step)) {
      if (type === 'end') {
        const hourDiff = moment(dateValue).diff(
          moment(this.handleMin()),
          'hours',
          true
        );
        this.filterEndFunction =
          hourDiff % moment.duration(this.step).asHours() === 0;
        return;
      } else if (type === 'begin') {
        const hourDiff = moment(dateValue).diff(
          moment(this.handleMin()),
          'hours',
          true
        );
        this.filterBeginFunction =
          hourDiff % moment.duration(this.step).asHours() === 0;
        return;
      }
    } else if (this.ogcFilterTimeService.stepIsMinuteDuration(this.step)) {
      if (type === 'end') {
        this.filterEndFunction = true;
        return;
      } else if (type === 'begin') {
        this.filterBeginFunction = true;
        return;
      }
    }

    this.filterEndFunction = diff % this.stepMilliseconds === 0;
    this.filterBeginFunction = diff % this.stepMilliseconds === 0;
    return;
  }

  private getDateTime(date: Date, pos: number): Date {
    const valuetmp = new Date(date);
    if (this.sliderMode()) return valuetmp;

    if (this.currentFilter().calendarModeYear) {
      valuetmp.setHours(0, 0, 0, 0);
    } else if (this.calendarType() === 'datetime') {
      const reference = pos === 1 ? this.beginValue : this.endValue;
      const existingTime = resolveDate(reference);
      valuetmp.setHours(existingTime.getHours(), existingTime.getMinutes());
    }
    return valuetmp;
  }

  private updateValues() {
    this.changeTemporalProperty(this.beginValue, 1, false);
    this.changeTemporalProperty(this.endValue, 2, true);
  }

  private handleMin() {
    const options = this.datasource().options;
    return this.currentFilter().begin
      ? this.currentFilter().begin
      : options.minDate
        ? options.minDate
        : this._defaultMin;
  }

  private handleMax() {
    const options = this.datasource().options;
    return this.currentFilter().end
      ? this.currentFilter().end
      : options.maxDate
        ? options.maxDate
        : this._defaultMax;
  }

  private setFilterStateDisable() {
    if (this.currentFilter) {
      this.filterStateDisable = !this.currentFilter().active;
    } else {
      this.filterStateDisable = false;
    }
  }

  private getDateFromStringWithoutTime(stringDate: string): Date {
    // warning create date with no time make a date UTC with TZ and the date create maybe not the same year, month and day
    // exemple:
    // new Date('2022-01-01') -> Fri Dec 31 2021 19:00:00 GMT-0500 (heure normale de l’Est nord-américain)
    // to create same date as string, add time 00 in the creation
    // new Date('2022-01-01 00:00:00') -> Sat Jan 01 2022 00:00:00 GMT-0500 (heure normale de l’Est nord-américain)
    let year;
    let month = '01';
    let day = '01';
    if (stringDate.length === 10) {
      const dateItems = stringDate.split('-');
      if (dateItems.length !== 3) {
        throw new Error(
          'Error in config date begin-end for ogcFilter: Date without time format need to be YYYY-MM-DD or YYYY'
        );
      } else {
        year = dateItems[0];
        month = dateItems[1];
        day = dateItems[2];
      }
    } else if (stringDate.length === 4) {
      year = stringDate;
    } else {
      return new Date(stringDate);
    }
    return new Date(`${year}-${month}-${day} 00:00:00`);
  }

  private parseDateToComparable(date: string): TimeFrame | number {
    return isTimeFrame(date) ? date : this.parseFilter(date).getTime();
  }
}

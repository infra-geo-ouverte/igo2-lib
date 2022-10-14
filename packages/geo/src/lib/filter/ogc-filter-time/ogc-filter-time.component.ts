import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  OnInit
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { OgcFilterOperator } from '../../filter/shared/ogc-filter.enum';
import { OGCFilterTimeService } from '../shared/ogc-filter-time.service';
import {
  OgcFilterableDataSourceOptions,
  OgcFilterableDataSource,
  OgcFilterDuringOptions
} from '../shared/ogc-filter.interface';

import { default as moment } from 'moment';

@Component({
  selector: 'igo-ogc-filter-time',
  templateUrl: './ogc-filter-time.component.html',
  styleUrls: ['./ogc-filter-time.component.scss']
})
export class OgcFilterTimeComponent implements OnInit {
  @Input() datasource: OgcFilterableDataSource;
  @Input() currentFilter: any;
  @Output() changeProperty: EventEmitter<{
    value: string;
    pos: number;
    refreshFilter: boolean;
  }> = new EventEmitter<any>();

  beginHours: number[];
  endHours: number[];
  beginMinutes: number[];
  endMinutes: number[];
  beginHourFormControl = new UntypedFormControl();
  beginMinuteFormControl = new UntypedFormControl();
  endHourFormControl = new UntypedFormControl();
  endMinuteFormControl = new UntypedFormControl();
  _beginValue: Date;
  _endValue: Date;
  readonly _defaultMin: string = '1900-01-01';
  readonly _defaultMax: string = '2052-01-06';
  readonly _defaultDisplayFormat: string = 'DD/MM/YYYY HH:mm A';
  readonly _defaultSliderModeEnabled: boolean = true;
  ogcFilterOperator = OgcFilterOperator;
  public sliderMode = false;

  readonly defaultStepMillisecond = 60000;
  public options: OgcFilterableDataSourceOptions;

  public onlyYearBegin: number;
  public onlyYearEnd: number;
  public calendarTypeYear = false;
  public resetIcon = 'replay';
  public filterStateDisable: boolean;

  @ViewChild('endDatepickerTime') endDatepickerTime: ElementRef;
  @ViewChild('beginDatepickerTime') beginDatepickerTime: ElementRef;
  @ViewChild('beginTime') beginTime: HTMLInputElement;
  @ViewChild('endTime') endTime: HTMLInputElement;

  get step(): string {
    return this.datasource.options.stepDate
      ? this.datasource.options.stepDate
      : this.currentFilter.step;
  }

  get stepMilliseconds(): number {
    const step = moment.duration(this.step).asMilliseconds();
    return step === 0 ? this.defaultStepMillisecond : step;
  }

  set beginValue(begin: Date) {
    this._beginValue = begin;
  }

  get beginValue(): Date {
    return this._beginValue;
  }

  set endValue(end: Date) {
    this._endValue = end;
  }

  get endValue(): Date {
    return this._endValue;
  }

  get sliderInterval(): number {
    return this.currentFilter.sliderInterval === undefined
      ? 2000
      : this.currentFilter.sliderInterval;
  }

  get maxDate(): string {
    return this.datasource.options.maxDate ? this.datasource.options.maxDate : this._defaultMax;
  }

  get displayFormat(): string {
    return this.currentFilter.displayFormat ? this.currentFilter.displayFormat : this._defaultDisplayFormat;
  }

  constructor(public ogcFilterTimeService: OGCFilterTimeService) {}

  ngOnInit(){
    if (this.currentFilter.sliderOptions) {
      this.currentFilter.sliderOptions.enabled = this.currentFilter.sliderOptions.enabled !== undefined ?
        this.currentFilter.sliderOptions.enabled : this._defaultSliderModeEnabled;
    }
    this.beginValue = this.parseFilter(this.handleMin());
    this.endValue = this.parseFilter(this.handleMax());

    this.onlyYearBegin = this.beginValue.getUTCFullYear();
    this.onlyYearEnd = this.endValue.getUTCFullYear();
    this.calendarTypeYear = this.isCalendarYearMode();
    this.setFilterStateDisable();
    this.updateHoursMinutesArray();
    // update value for now value
    this.updateValues();
  }

  parseFilter(filter): Date {
    if (!filter){
      return new Date();
    } else if ( isNaN( new Date(filter).getTime() ) ) {
      if (filter.search('now') >= 0 ) {
        const interval = filter.match(/years|months|weeks|days|hours|seconds/);
        if (filter.match(/\+/)) {
          const intervalInt = parseInt(
            filter.substring(filter.search('+') + 1, interval.index),
            10
          );
          return moment().add(intervalInt, interval[0]).toDate();
        }
        if (filter.match(/\-/)) {
          const intervalInt = parseInt(
            filter.substring(filter.search('-') + 1, interval.index),
            10
          );
          return moment().subtract(intervalInt, interval[0]).toDate();
        }
        return new Date();
      }
      if (filter.search('today') >= 0){
        const _now = moment().endOf('day').toDate();
        const interval = filter.match(/years|months|weeks|days|hours|seconds/);
        if ( filter.match(/\+/) ) {
          const intervalInt = parseInt( filter.substring(filter.search('+') + 1, interval.index), 10 );
          return moment(_now).add(intervalInt, interval[0]).toDate();
        }
        if ( filter.match(/\-/) ) {
          const intervalInt = parseInt(filter.substring(filter.search('-') + 1, interval.index), 10);
          return moment(_now).subtract(intervalInt, interval[0]).toDate();
        }
        return _now;
      }
      return new Date();
    }
    if (this.currentFilter.calendarModeYear) {
      const date = this.getDateFromStringWithoutTime(filter);
      return date;
    } else {
      return filter ? new Date(filter) : new Date();
    }
  }

  changeTemporalProperty(value, position?, refreshFilter = true) {
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
        dateStringFromYearNotime = `${this.onlyYearEnd}-01-01`;
      }
      // call service with string date without time
      this.changeProperty.next({ value: dateStringFromYearNotime, pos: position, refreshFilter });
      return;
    }
    if (position === 2 && this.calendarType() === 'date' && !this.sliderMode) {
      /* Above month: see yearSelected or monthSelected */
      valueTmp = moment(valueTmp).endOf('day').toDate();
    }

    if (position === 1) {
      this.beginValue = valueTmp;
      if (this.restrictedToStep()) {
        this.changeTemporalProperty(this.ogcFilterTimeService.addStep(valueTmp, this.stepMilliseconds), 2, refreshFilter);
      }
    } else {
      this.endValue = valueTmp;
    }
    this.updateHoursMinutesArray();
    this.changeProperty.next({ value: valueTmp.toISOString(), pos: position, refreshFilter });
  }

  handleDate(value): Date {
    if (!value || value === '') {
      return undefined;
    }
    if (typeof(value) === 'string' && this.currentFilter.calendarModeYear) {
      return this.getDateFromStringWithoutTime(value);
    }
    return new Date(value);
  }

  calendarType() {
    if (this.currentFilter.calendarModeYear) {
      return 'year';
    }
    if (this.stepMilliseconds < 86400000) {
      return 'datetime';
    }
    return 'date';
  }

  isCalendarYearMode(): boolean {
    if (this.calendarType() === 'year') {
      return true;
    } else {
      return false;
    }
  }

  yearOnlyInputChange(changeEvent, datePicker?: any, property?: string) {
    const year = changeEvent.target.value;
    const date = this.getDateFromStringWithoutTime(year);
    this.yearSelected(date, datePicker, property);
  }

  yearSelected(year, datePicker?: any, property?: string, refreshFilter = true) {
    if (this.ogcFilterTimeService.stepIsYearDuration(this.step)) {
      if (datePicker) {
        datePicker.close();
      }
      if (property === 'end') {
        // change value 01 jan to 31 dec same year
        year = moment(year).endOf('year').toDate();
      } else if (property === 'begin' && this.restrictedToStep() && !this.calendarTypeYear) {
        this.yearSelected(year, undefined, 'end');
      }
      this.changeTemporalProperty(year, property === 'begin' ? 1 : 2, refreshFilter);
    }
  }

  monthSelected(month, datePicker?: any, property?: string, refreshFilter = true) {
    if (this.ogcFilterTimeService.stepIsMonthDuration(this.step)) {
      if (datePicker) {
        datePicker.close();
      }
      if (property === 'end') {
        month = moment(month).endOf('month').toDate();
      } else if (property === 'begin' && this.restrictedToStep()) {
        this.monthSelected(month, undefined, 'end');
      }
      this.changeTemporalProperty(month, property === 'begin' ? 1 : 2, refreshFilter);
    }
  }

  calendarView() {
    const test = this.stepMilliseconds;
    const diff = Math.abs(
      this.parseFilter(this.currentFilter.end).getTime() -
        this.parseFilter(this.currentFilter.begin).getTime()
    );
    if (this.ogcFilterTimeService.stepIsYearDuration(this.step)) {
      return 'multi-year';
    } else if (this.ogcFilterTimeService.stepIsMonthDuration(this.step)) {
      return 'year';
    } else if (test < 86400000 && diff < 86400000) {
      return 'clock';
    } else {
      return 'month';
    }
  }

  dateFilter(type: string, date: string): boolean {
    const dateValue = new Date(date);
    const diff = dateValue.getTime() - new Date(this.handleMin()).getTime();

    if (this.ogcFilterTimeService.stepIsYearDuration(this.step)) {
      const monthDiff = moment(dateValue).diff(moment(this.handleMin()), 'years', true);
      if ( type === 'end' ) {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const monthDiffPlus1 = moment(dateValuePlus1).diff(moment(this.handleMin()), 'years', true);
        return (monthDiffPlus1 % moment.duration(this.step).asYears()) === 0;
      } else if ( type === 'begin' ) {
        return (monthDiff % moment.duration(this.step).asYears()) === 0;
      }
    }
    else if (this.ogcFilterTimeService.stepIsMonthDuration(this.step)) {
      const monthDiff = moment(dateValue).diff(moment(this.handleMin()), 'months', true);
      if ( type === 'end' ) {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const monthDiffPlus1 = moment(dateValuePlus1).diff(moment(this.handleMin()), 'months', true);
        return (monthDiffPlus1 % moment.duration(this.step).asMonths()) === 0;
      } else if ( type === 'begin' ) {
        return (monthDiff % moment.duration(this.step).asMonths()) === 0;
      }
    } else if (this.ogcFilterTimeService.stepIsWeekDuration(this.step)) {
      const weekDiff = moment(dateValue).diff(moment(this.handleMin()), 'weeks', true);
      if ( type === 'end' ) {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const weekDiffPlus1 = moment(dateValuePlus1).diff(moment(this.handleMin()), 'weeks', true);
        return (weekDiffPlus1 % moment.duration(this.step).asWeeks()) === 0;
      } else if ( type === 'begin' ) {
        return (weekDiff % moment.duration(this.step).asWeeks()) === 0;
      }
    } else if (this.ogcFilterTimeService.stepIsDayDuration(this.step)) {
      const dayDiff = moment(dateValue).diff(moment(this.handleMin()), 'days', true);
      if ( type === 'end' ) {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const dayDiffPlus1 = moment(dateValuePlus1).diff(moment(this.handleMin()), 'days', true);
        const _mod = (dayDiffPlus1 % moment.duration(this.step).asDays());
        return (_mod < 0.0000001 && _mod > -0.0000001) || _mod === 0 ; // 1 millisecond = 1.1574074074074076e-8
      } else if ( type === 'begin' ) {
        const _mod = ((dayDiff % moment.duration(this.step).asDays()) + 1);
        return (_mod < 0.0000001 && _mod > -0.0000001 && _mod !== 0) || _mod === 1 ; // 1 millisecond = 1.1574074074074076e-8
      }
    } else if ( this.ogcFilterTimeService.stepIsHourDuration(this.step) ) {
      const hourDiff = moment(dateValue).diff(moment(this.handleMin()), 'hours', true);
      return (hourDiff % moment.duration(this.step).asHours()) === 0;

    } else if ( this.ogcFilterTimeService.stepIsMinuteDuration(this.step) ) {
      return true;
    }

    return diff % this.stepMilliseconds === 0;
  }

  getDateTime(date, pos) {
    const valuetmp = new Date(date);
    let valuetmp2;
    if (!this.sliderMode) {
      switch (pos) {
        case 1: {
          if (this.currentFilter.calendarModeYear) {
            valuetmp2 = valuetmp.setHours(0, 0);
            break;
          } else {
            valuetmp2 = valuetmp.setHours(
            this.beginHourFormControl.value,
            this.beginMinuteFormControl.value
            );
            break;
          }
        }
        case 2: {
          if (this.currentFilter.calendarModeYear) {
            valuetmp2 = valuetmp.setHours(0, 0);
            break;
          } else {
            valuetmp2 = valuetmp.setHours(
              this.endHourFormControl.value,
              this.endMinuteFormControl.value
            );
            break;
          }
        }
      }
    }
    return new Date(valuetmp2 ? valuetmp2 : valuetmp);
  }

  handleMinuteIncrement() {
    if (this.ogcFilterTimeService.stepIsMinuteDuration(this.step)) {
      if (this.stepMilliseconds < 3600000) {
        return this.stepMilliseconds / 1000 === 60 ? 1 : this.stepMilliseconds / 1000;
      } else {
        return (this.stepMilliseconds % 3600000) / 60;
      }
    } else if (this.ogcFilterTimeService.stepIsHourDuration(this.step)) {
      return 60;
    }
    return 1;
  }

  handleHourIncrement() {
    if (this.ogcFilterTimeService.stepIsHourDuration(this.step)) {
      return this.stepMilliseconds / 1000 / 60 / 60;
    }
    return 1;
  }

  fullBeginHoursArray(checkEndValue?) {
    if (checkEndValue) {
      this.beginHours = Array.from(
        {
          length:
            (this.endHourFormControl.value - 0) / this.handleHourIncrement() + 1
        },
        (_, i) => 0 + i * this.handleHourIncrement()
      );
    } else {
      this.beginHours = Array.from(
        { length: (23 - 0) / this.handleHourIncrement() + 1 },
        (_, i) => 0 + i * this.handleHourIncrement()
      );
    }
    this.beginHourFormControl.setValue(this.beginValue.getHours());
  }

  fullEndHoursArray(checkEndValue?) {
    if (checkEndValue) {
      this.endHours = Array.from(
        {
          length:
            (23 - this.beginHourFormControl.value) /
              this.handleHourIncrement() +
            1
        },
        (_, i) =>
          this.beginHourFormControl.value + i * this.handleHourIncrement()
      );
    } else {
      this.endHours = Array.from(
        { length: (23 - 0) / this.handleHourIncrement() + 1 },
        (_, i) => 0 + i * this.handleHourIncrement()
      );
    }
    this.endHourFormControl.setValue(this.endValue.getHours());
  }

  fullBeginMinutesArray(checkEndValue?) {
    if (checkEndValue) {
      this.beginMinutes = Array.from(
        {
          length:
            (this.endMinuteFormControl.value - 0) /
              this.handleMinuteIncrement() +
            1
        },
        (_, i) => 0 + i * this.handleMinuteIncrement()
      );
    } else {
      this.beginMinutes = Array.from(
        { length: (59 - 0) / this.handleMinuteIncrement() + 1 },
        (_, i) => 0 + i * this.handleMinuteIncrement()
      );
    }
    this.beginMinuteFormControl.setValue(this.beginValue.getMinutes());
  }

  fullEndMinutesArray(checkEndValue?) {
    if (checkEndValue) {
      this.endMinutes = Array.from(
        {
          length:
            (59 - this.beginMinuteFormControl.value) /
              this.handleMinuteIncrement() +
            1
        },
        (_, i) =>
          this.beginMinuteFormControl.value + i * this.handleMinuteIncrement()
      );
    } else {
      this.endMinutes = Array.from(
        { length: (59 - 0) / this.handleMinuteIncrement() + 1 },
        (_, i) => 0 + i * this.handleMinuteIncrement()
      );
    }
    this.endMinuteFormControl.setValue(this.endValue.getMinutes());
  }

  updateHoursMinutesArray() {
    const beginTmp = new Date(this.beginValue);
    const endTmp = new Date(this.endValue);
    if (beginTmp.setHours(0, 0) === endTmp.setHours(0, 0)) {
      this.fullBeginHoursArray(true);
      this.fullEndHoursArray(true);
      if (this.beginValue.getHours() === this.endValue.getHours()) {
        this.fullBeginMinutesArray(true);
        this.fullEndMinutesArray(true);
      }
    } else {
      this.fullBeginHoursArray();
      this.fullEndHoursArray();
      this.fullBeginMinutesArray();
      this.fullEndMinutesArray();
    }
  }

  private updateValues() {
    this.changeTemporalProperty(this.beginValue, 1, false);
    this.changeTemporalProperty(this.endValue, 2, true);
  }

  public restrictedToStep(): boolean {
    return this.currentFilter.restrictToStep
      ? this.currentFilter.restrictToStep : false;
  }

  public handleMin() {
    return this.currentFilter.begin ? this.currentFilter.begin :
              (this.datasource.options.minDate ? this.datasource.options.minDate : this._defaultMin);
  }

  public handleMax() {
    return this.currentFilter.end ? this.currentFilter.end :
              (this.datasource.options.maxDate ? this.datasource.options.maxDate : this._defaultMax);
  }

  changePropertyByPass(event) {
    this.changeProperty.next(event);
  }

  modeChange(event) {
    if (!event.checked) {
      this.updateValues();
    }
  }

  setFilterStateDisable() {
    if (this.currentFilter) {
      this.filterStateDisable = !this.currentFilter.active;
    } else {
      this.filterStateDisable = false;
    }
    if(this.calendarType() === 'datetime') {
      if (this.filterStateDisable === true) {
        this.beginHourFormControl.disable();
        this.beginMinuteFormControl.disable();
        this.endHourFormControl.disable();
        this.endMinuteFormControl.disable();
      } else {
        this.beginHourFormControl.enable();
        this.beginMinuteFormControl.enable();
        this.endHourFormControl.enable();
        this.endMinuteFormControl.enable();
      }
    }
  }
  getDateFromStringWithoutTime(stringDate: string): Date {
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
          throw new Error('Error in config date begin-end for ogcFilter: Date without time format need to be YYYY-MM-DD or YYYY');
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

  resetFilter() {
    let filterOriginConfig = this.datasource.options.ogcFilters.filters as OgcFilterDuringOptions;

    let minDefaultDate;
    let maxDefaultDate;
    let minDefaultISOString;
    let maxDefaultISOString;

    if (this.calendarTypeYear) {
      if (filterOriginConfig.end === 'today') {
        let todayDateStringNoTime = new Date().toLocaleDateString('en-CA'); // '2022-02-13'
        maxDefaultISOString = `${todayDateStringNoTime.substring(0,4)}-01-01`;
      } else {
        maxDefaultISOString = `${filterOriginConfig.end.substring(0,4)}-01-01`;
      }
      minDefaultISOString = `${filterOriginConfig.begin.substring(0,4)}-01-01`;
      minDefaultDate = this.getDateFromStringWithoutTime(minDefaultISOString);
      maxDefaultDate = this.getDateFromStringWithoutTime(maxDefaultISOString);
    } else {
      minDefaultDate = this.parseFilter(filterOriginConfig.begin);
      maxDefaultDate = this.parseFilter(filterOriginConfig.end);
      minDefaultISOString = minDefaultDate.toISOString();
      maxDefaultISOString = maxDefaultDate.toISOString();
    }

    if ((this.currentFilter.begin !== minDefaultISOString ) ||
    (this.currentFilter.end !== maxDefaultISOString)) {
      this.beginValue = minDefaultDate;
      this.endValue = maxDefaultDate;
      this.updateValues();
    }
  }

  toggleFilterState() {
    if (this.currentFilter.active === true) {
      this.currentFilter.active = false;
    } else {
      this.currentFilter.active = true;
    }
    this.setFilterStateDisable();
    this.updateValues();
  }
}

import { Component, Input, ChangeDetectionStrategy, 
        ViewChild, ElementRef, Output, EventEmitter, OnInit } from '@angular/core';
import { OgcFilterOperator } from '../../filter/shared/ogc-filter.enum';
import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map';
import { OgcFilterableDataSourceOptions, OgcFilterableDataSource, OgcFiltersOptions } from '../shared/ogc-filter.interface';
import { NgxMatTimepickerComponent } from '@angular-material-components/datetime-picker';
import * as moment_ from 'moment';
const moment = moment_;

@Component({
  selector: 'igo-ogc-filter-time',
  templateUrl: './ogc-filter-time.component.html',
  styleUrls: ['./ogc-filter-time.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OgcFilterTimeComponent implements OnInit {
  
  @Input() datasource: OgcFilterableDataSource;
  @Input() currentFilter: any;
  @Output() changeProperty: EventEmitter<{value: string, pos: number}> = new EventEmitter();

  _beginValue: Date;
  _endValue: Date;
  ogcFilterOperator = OgcFilterOperator;

  public defaultStepMillisecond = 6000;
  public options: OgcFilterableDataSourceOptions;

  @ViewChild('endDatepickerTime') endDatepickerTime: ElementRef;
  @ViewChild('beginDatepickerTime') beginDatepickerTime: ElementRef;
  @ViewChild('endHour') endHour: NgxMatTimepickerComponent<any>;
  @ViewChild('beginHour') beginHour: NgxMatTimepickerComponent<any>;
  @ViewChild('beginTime') beginTime: HTMLInputElement;
  @ViewChild('endTime') endTime: HTMLInputElement;

  get step(): string {
    return this.datasource.options.stepDate ? this.datasource.options.stepDate : this.currentFilter.step;
  }

  get stepMilliseconds(): number {
    const step = moment.duration(this.step).asMilliseconds();
    return step === 0 ? this.defaultStepMillisecond : step;
  }

  set beginValue(begin: Date) {
    this._beginValue = begin;
  }

  set endValue(end: Date) {
    this._endValue = end;
  }

  get beginValue(): Date {
    return this._beginValue;
  }

  get endValue(): Date {
    return this._endValue;
  }

  constructor() {}

  ngOnInit(){
    this.beginValue = new Date(this.currentFilter.begin);
    this.endValue = new Date(this.currentFilter.end);
  }

  changeTemporalProperty(value, time?, event?, pos? ) {
    let valueTmp = this.getDateTime(value, time, event);

    if (pos === 2 && this.calendarType() === 'date') {
      /* Above month: see yearSelected or monthSelected */
      if ( this.calendarType() !== 'datetime'  ) {
        valueTmp = moment(valueTmp).endOf('day').toDate();
      }
    }
    
    if (pos === 1) {
      this.beginValue = valueTmp;
    } else {
      this.endValue = valueTmp;
    }

    this.changeProperty.next({'value': valueTmp.toISOString(), 'pos': pos});
  }

  handleDate(value) : Date {
    if ( !value || value === '') {
      return undefined;
    }
    return new Date(value);
  }

  calendarType() {
    if (this.stepMilliseconds < 86400000 ) {
      return 'datetime';
    }
    return 'date';
  }

  yearSelected(year, datePicker?: any, property?: string) {
    if (this.stepIsYearDuration()) {
        datePicker.close();
        if (property === 'end') {
          year = moment(year).endOf('year').toDate();
        }
        this.changeTemporalProperty(year, ( property === 'begin' ? 1 : 2));
    }
  }

  monthSelected(month, datePicker?: any, property?: string) {
    if (this.stepIsMonthDuration()) {
      datePicker.close();
      if (property === 'end') {
        month = moment(month).endOf('month').toDate();
      }
      this.changeTemporalProperty( month, ( property === 'begin' ? 1 : 2));
    }
  }

  calendarView() {
    const test = this.stepMilliseconds;
    const diff = Math.abs(new Date(this.currentFilter.end).getTime() - new Date(this.currentFilter.begin).getTime());
    if ( this.stepIsYearDuration() ) {
      return 'multi-year';
    } else if (this.stepIsMonthDuration()) {
      return 'year';
    } else if (test < 86400000 && diff < 86400000) {
      return 'clock';
    } else {
      return 'month';
    }
  }

  stepIsYearDuration() {
    const year = moment.duration(this.step);
    return (year.years() !== 0 && year.months() === 0 && year.weeks() === 0 && year.days() === 0 && year.hours() === 0 && year.minutes() === 0);
  }

  stepIsMonthDuration() {
    const month = moment.duration(this.step);
    return ( month.months() !== 0 && month.weeks() === 0 && month.days() === 0 && month.hours() === 0 && month.minutes() === 0);
  }

  stepIsWeekDuration() {
    const week = moment.duration(this.step);
    return ( week.weeks() !== 0 && week.days() === 7 && week.hours() === 0 && week.minutes() === 0);
  }

  stepIsDayDuration() {
    const day = moment.duration(this.step);
    return  (day.days() !== 0 && day.hours() === 0 && day.minutes() === 0);
  }
  
  stepIsHourDuration() {
    const hour = moment.duration(this.step);
    return ( hour.hours() !== 0 && hour.minutes() === 0);
  }

  stepIsMinuteDuration() {
    const minute = moment.duration(this.step);
    return ( minute.minutes() !== 0);
  }
  

  dateFilter(type: string, date: string ): boolean {
    const dateValue = new Date(date);
    const diff = dateValue.getTime() - new Date(this.datasource.options.minDate).getTime();

    if (this.stepIsMonthDuration()) {
      const monthDiff = moment(dateValue).diff(moment(this.datasource.options.minDate), 'months', true);
      if ( type === 'end' ) {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const monthDiffPlus1 =  moment(dateValuePlus1).diff(moment(this.datasource.options.minDate), 'months', true);
        return (monthDiffPlus1 % moment.duration(this.step).asMonths()) === 0;
      } else if ( type === 'begin' ) {
        return (monthDiff % moment.duration(this.step).asMonths()) === 0;
      }
    } else if (this.stepIsWeekDuration()) {
      const weekDiff = moment(dateValue).diff(moment(this.datasource.options.minDate), 'weeks', true);
      if ( type === 'end' ) {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const weekDiffPlus1 =  moment(dateValuePlus1).diff(moment(this.datasource.options.minDate), 'weeks', true);
        return (weekDiffPlus1 % moment.duration(this.step).asWeeks()) === 0;
      } else if ( type === 'begin' ) {
        return (weekDiff % moment.duration(this.step).asWeeks()) === 0;
      }
    } else if (this.stepIsDayDuration()) {
      const dayDiff = moment(dateValue).diff(moment(this.datasource.options.minDate), 'days', true);
      if ( type === 'end' ) {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const dayDiffPlus1 =  moment(dateValuePlus1).diff(moment(this.datasource.options.minDate), 'days', true);
        return (dayDiffPlus1 % moment.duration(this.step).asDays()) === 0;
      } else if ( type === 'begin' ) {
        return (dayDiff % moment.duration(this.step).asDays()) === 0;
      }
    } else if ( this.stepIsHourDuration() ) {
      const hourDiff = moment(dateValue).diff(moment(this.datasource.options.minDate), 'hours', true);
      return (hourDiff % moment.duration(this.step).asHours()) === 0;
      
    } else if ( this.stepIsMinuteDuration() ) {
      return true;
    }

    return diff % this.stepMilliseconds === 0;

  }
  
  getDateTime(date, time, eventTime) {
    let valuetmp = new Date(date);
    let valuetmp2;
    if (time?.nativeElement) {
      let timeAsDate = new Date(time.nativeElement.value);
      if (isNaN(timeAsDate.getTime())) {
        valuetmp2 = valuetmp.setHours(time.nativeElement.value.split(':')[0], time.nativeElement.value.split(':')[1]);
      } else {
        valuetmp2 = valuetmp.setHours(timeAsDate.getHours(), timeAsDate.getMinutes());
      }
    } 
    if (eventTime) {
      valuetmp2 = valuetmp.setHours(eventTime.instance.hourElement.value, eventTime.instance.minuteElement.value);
    }    
    return new Date(valuetmp2?valuetmp2:valuetmp);
  }

  handleMinuteIncrement() {
    if(this.stepIsMinuteDuration()) {
      if(this.stepMilliseconds < 3600000) {
        return this.stepMilliseconds / 1000;
      } else {
        return (this.stepMilliseconds % 3600000) / 60;
      }
    } else if ( this.stepIsHourDuration() ) {
      return 60;
    }
  }

  handleHourIncrement() {
    if(this.stepIsMinuteDuration()) {
      return 1;
    } else if ( this.stepIsHourDuration() ) {
      return this.stepMilliseconds / 1000 / 60 / 60;
    }
  }
}


import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { MatSlider } from '@angular/material';
import * as moment from 'moment';

import { TimeFilterOptions } from '../shared/time-filter.interface';

@Component({
  selector: 'igo-time-filter-form',
  templateUrl: './time-filter-form.component.html',
  styleUrls: ['./time-filter-form.component.scss']
})
export class TimeFilterFormComponent implements OnInit {
  @Input()
  get options(): TimeFilterOptions {
    return this._options;
  }
  set options(value: TimeFilterOptions) {
    this._options = value;
  }
  private _options: TimeFilterOptions;

  public date: Date;
  public startDate: Date;
  public endDate: Date;
  public year: any;
  public startYear: any;
  public endYear: any;
  public initStartYear: any;
  public initEndYear: any;
  public listYears: Array<string> = [];
  public startListYears: Array<string> = [];
  public endListYears: Array<string> = [];

  @Input()
  set currentValue(value: string) {
    if (value) {
      if (this.type !== 'year') {
        const valueArray = value.split('/');
        if (valueArray.length > 0) {
          const startDate = new Date(valueArray[0]);
          const endDate = new Date(valueArray[1]);
          if (!isNaN(startDate.valueOf())) {
            this.startDate = startDate;
          }
          if (!isNaN(endDate.valueOf())) {
            this.endDate = endDate;
          }
        }
      }
    }
  }

  public interval: any;
  public playIcon = 'play_circle_filled';

  @Output() change: EventEmitter<Date | [Date, Date]> = new EventEmitter();
  @Output()
  yearChange: EventEmitter<string | [string, string]> = new EventEmitter();
  @ViewChild(MatSlider) mySlider;

  get type(): 'date' | 'time' | 'datetime' | 'year' {
    return this.options.type === undefined ? 'date' : this.options.type;
  }

  get isRange(): boolean {
    return this.options.range === undefined || this.options.style === 'slider'
      ? false
      : this.options.range;
  }

  get style(): string {
    return this.options.style === undefined ? 'slider' : this.options.style;
  }

  get step(): number {
    let step = 10800000;
    if (this.options.step === undefined) {
      switch (this.type) {
        case 'date':
        case 'datetime':
          step = 10800000;
          break;
        case 'time':
          step = 3600000;
          break;
        case 'year':
          step = 31536000000;
          break;
        default:
          step = 10800000;
      }
    } else {
      step = this.getStepDefinition(this.options.step);
    }

    return step;
  }

  get timeInterval(): number {
    return this.options.timeInterval === undefined
      ? 2000
      : this.options.timeInterval;
  }

  get min(): Date {
    return this.options.min === undefined
      ? undefined
      : new Date(this.options.min);
  }

  get max(): Date {
    return this.options.max === undefined
      ? undefined
      : new Date(this.options.max);
  }

  get is(): boolean {
    return this.options.range === undefined ? false : this.options.range;
  }

  constructor() {}

  ngOnInit() {
    if (this.startDate === undefined) {
      const utcmin = new Date(this.min);
      this.startDate = new Date(
        utcmin.getTime() + utcmin.getTimezoneOffset() * 60000
      );
    }
    if (this.endDate === undefined) {
      const utcmax = new Date(this.max);
      this.endDate = new Date(
        utcmax.getTime() + utcmax.getTimezoneOffset() * 60000
      );
    }
    if (this.startYear === undefined) {
      this.startYear = new Date(this.startDate).getFullYear();
      this.initStartYear = this.startYear;
    }
    if (this.endYear === undefined) {
      this.endYear = new Date(this.endDate).getFullYear();
      this.initEndYear = this.endYear;
    }

    if (!this.isRange) {
      for (let i = this.startYear; i <= this.endYear + 1; i++) {
        this.listYears.push(i);
      }
    } else {
      for (let i = this.startYear; i < this.endYear; i++) {
        this.startListYears.push(i);
      }
      for (let i = this.startYear + 1; i <= this.endYear; i++) {
        this.endListYears.push(i);
      }
    }
  }

  handleDateChange(event: any) {
    this.setupDateOutput();
    this.applyTypeChange();

    // Only if is range, use 2 dates to make the range
    if (this.isRange) {
      this.change.emit([this.startDate, this.endDate]);
    } else {
      this.change.emit(this.startDate);
    }
  }

  handleYearChange(event: any) {
    if (this.isRange) {
      this.endListYears = [];
      for (let i = this.startYear + 1; i <= this.initEndYear; i++) {
        this.endListYears.push(i);
      }
      this.startListYears = [];
      for (let i = this.initStartYear + 1; i < this.endYear; i++) {
        this.startListYears.push(i);
      }
      this.yearChange.emit([this.startYear, this.endYear]);
    } else {
      this.yearChange.emit(this.year);
    }
  }

  handleListYearChange(event: any) {
    this.handleYearChange([this.startYear, this.endYear]);
  }

  handleListYearStartChange(event: any) {
    this.change.emit([this.startDate, this.endDate]);
  }

  dateToNumber(date: Date): number {
    let newDate;
    if (date) {
      newDate = new Date(date);
    } else {
      newDate = new Date(this.min);
    }

    return newDate.getTime();
  }

  setSliderThumbLabel(label: string) {
    const thumbLabel = this.findThumbLabel(
      this.mySlider._elementRef.nativeElement.childNodes
    );
    if (thumbLabel) {
      thumbLabel.textContent = label;
    }
  }

  findThumbLabel(test: any[]): any {
    let thumbLabel;

    test.forEach(value => {
      if (value.className === 'mat-slider-thumb-label-text') {
        thumbLabel = value;
      }

      if (value.children.length > 0 && !thumbLabel) {
        thumbLabel = this.findThumbLabel(value.childNodes);
      }
    }, this);
    return thumbLabel;
  }

  playFilter(event: any) {
    if (this.interval) {
      this.stopFilter();
    } else {
      this.playIcon = 'pause_circle_filled';
      this.interval = setInterval(
        function(that) {
          let newMinDateNumber;
          const maxDateNumber = new Date(that.max);

          newMinDateNumber =
            that.date === undefined ? that.min.getTime() : that.date.getTime();
          newMinDateNumber += that.mySlider.step;
          that.date = new Date(newMinDateNumber);

          if (newMinDateNumber > maxDateNumber.getTime()) {
            that.stopFilter();
          }

          that.handleDateChange({ value: that.date, date: that.date });
        },
        this.timeInterval,
        this
      );
    }
  }

  stopFilter() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = undefined;
    this.playIcon = 'play_circle_filled';
  }

  handleSliderDateChange(event: any) {
    this.date = new Date(event.value);
    this.setSliderThumbLabel(this.handleSliderTooltip());
    this.handleDateChange(event);
  }

  handleSliderValue(): number {
    if (this.options.current === true || !this.min) {
      const currentDate = new Date();
      this.date = this.getRoundedDate(currentDate);
    }
    return this.date === undefined ? this.min.getTime() : this.date.getTime();
  }

  handleSliderTooltip() {
    let label: string;

    switch (this.type) {
      case 'date':
        label =
          this.date === undefined
            ? this.min.toDateString()
            : this.date.toDateString();
        break;
      case 'time':
        label =
          this.date === undefined
            ? this.min.toTimeString()
            : this.date.toTimeString();
        break;
      // datetime
      default:
        label =
          this.date === undefined
            ? this.min.toUTCString()
            : this.date.toUTCString();
        break;
    }

    return label;
  }

  setupDateOutput() {
    if (this.style === 'slider') {
      this.startDate = new Date(this.date);
      this.startDate.setSeconds(-(this.step / 1000));
      this.endDate = new Date(this.startDate);
      this.endDate.setSeconds(this.step / 1000);
    } else if (!this.isRange && !!this.date) {
      this.endDate = new Date(this.date);
      this.startDate = new Date(this.date);
    } else if (this.isRange && (!!this.date || !this.date)) {
      this.startDate =
        this.startDate === undefined ? new Date(this.min) : this.startDate;
      this.endDate =
        this.endDate === undefined ? new Date(this.max) : this.endDate;
    } else if (!this.date) {
      this.startDate =
        this.startDate === undefined ? new Date(this.min) : this.startDate;
      this.endDate =
        this.endDate === undefined ? new Date(this.max) : this.endDate;
    }
  }

  applyTypeChange() {
    switch (this.type) {
      case 'date':
        if (this.startDate !== undefined || this.endDate !== undefined) {
          this.startDate.setHours(0);
          this.startDate.setMinutes(0);
          this.startDate.setSeconds(0);
          this.endDate.setHours(23);
          this.endDate.setMinutes(59);
          this.endDate.setSeconds(59);
        }
        break;
      case 'time':
        if (this.style === 'calendar') {
          if (this.startDate.getDay() !== this.min.getDay()) {
            const selectedHour = this.startDate.getHours();
            const selectedMinute = this.startDate.getMinutes();
            this.startDate = this.min;
            this.startDate.setHours(selectedHour);
            this.startDate.setMinutes(selectedMinute);
          }

          if (this.endDate.getDay() !== this.min.getDay()) {
            const selectedHour = this.endDate.getHours();
            const selectedMinute = this.endDate.getMinutes();
            this.endDate = this.min;
            this.endDate.setHours(selectedHour);
            this.endDate.setMinutes(selectedMinute);
          }
        }

        if (!this.isRange && this.step > 60 * 60 * 1000) {
          this.startDate.setMinutes(0);
          this.startDate.setSeconds(0);
          this.endDate.setMinutes(59);
          this.endDate.setSeconds(59);
        }
        break;
      // datetime
      default:
      // do nothing
    }
  }

  getRangeMinDate(): Date {
    return this.startDate === undefined ? this.min : this.startDate;
  }

  getRangeMaxDate(): Date {
    return this.endDate === undefined ? this.max : this.endDate;
  }

  /**
  Round date at a certain time, 10 minutes by Default
  @param date - Date to Round
  @param atMinute - round to closest 'atMinute' minute, rounded 10 by default
  @return the rounded date
  */
  getRoundedDate(date, atMinute = 10) {
    const coeff = 1000 * 60 * atMinute;
    return new Date(Math.round(date.getTime() / coeff) * coeff);
  }

  /**
  Get the step (period) definition from the layer dimension tag
  @param step The step as ISO 8601 example: PT10M for 10 Minutes
  @return the duration in milliseconds
  */
  getStepDefinition(step) {
    return moment.duration(step).asMilliseconds();
  }
}

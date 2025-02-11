import { NgFor, NgIf } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import {
  DateAdapter,
  MatNativeDateModule,
  MatOptionModule,
  ThemePalette
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSlider, MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import olSourceImageWMS from 'ol/source/ImageWMS';

import {
  MatDatetimepickerModule,
  MatNativeDatetimeModule
} from '@mat-datetimepicker/core';
import { default as moment } from 'moment';

import { Layer } from '../../layer';
import { isDateOrRangeInRange, parseDateString } from '../shared/date.utils';
import { isTimeFrame, parseDateOperation } from '../shared/filter.utils';
import { TimeFilterStyle, TimeFilterType } from '../shared/time-filter.enum';
import { TimeFilterOptions } from '../shared/time-filter.interface';

@Component({
  selector: 'igo-time-filter-form',
  templateUrl: './time-filter-form.component.html',
  styleUrls: ['./time-filter-form.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    MatFormFieldModule,
    MatDatetimepickerModule,
    MatMomentDateModule,
    MatNativeDatetimeModule,
    MatNativeDateModule, // For the DateAdapter provider
    MatInputModule,
    FormsModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class TimeFilterFormComponent implements OnInit {
  public color: ThemePalette = 'primary';
  public date: Date;
  public startDate: Date;
  public endDate: Date;
  public year: any;
  public startYear: any;
  public endYear: any;
  public initStartYear: any;
  public initEndYear: any;
  public listYears: string[] = [];
  public startListYears: string[] = [];
  public endListYears: string[] = [];

  public interval: number;
  public playIcon = 'play-circle';
  public resetIcon = 'replay';

  @Input() layer: Layer;

  @Input() options: TimeFilterOptions;

  @Input()
  set currentValue(value: string) {
    if (value) {
      if (this.type !== TimeFilterType.YEAR) {
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

  @Output() dateChange = new EventEmitter<Date | [Date, Date]>();

  @Output()
  yearChange = new EventEmitter<string | [string, string]>();
  @ViewChild(MatSlider) mySlider;

  get type(): TimeFilterType {
    return this.options.type === undefined
      ? TimeFilterType.DATE
      : this.options.type;
  }

  get isRange(): boolean {
    return this.options.range === undefined ||
      this.options.style === TimeFilterStyle.SLIDER
      ? false
      : this.options.range;
  }

  get style(): TimeFilterStyle {
    return this.options.style === undefined
      ? TimeFilterStyle.SLIDER
      : this.options.style;
  }

  get step(): number {
    let step = 10800000;
    if (this.options.step === undefined) {
      switch (this.type) {
        case TimeFilterType.DATE:
        case TimeFilterType.DATETIME:
          step = 10800000;
          break;
        case TimeFilterType.TIME:
          step = 3600000;
          break;
        case TimeFilterType.YEAR:
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
    if (this.options.min) {
      const min = isTimeFrame(this.options.min)
        ? new Date(parseDateOperation(this.options.min))
        : new Date(this.options.min);
      return new Date(min.getTime() + min.getTimezoneOffset() * 60000);
    } else {
      return undefined;
    }
  }

  get max(): Date {
    if (this.options.max) {
      const max = isTimeFrame(this.options.max)
        ? new Date(parseDateOperation(this.options.max))
        : new Date(this.options.max);

      return new Date(max.getTime() + max.getTimezoneOffset() * 60000);
    } else {
      return undefined;
    }
  }

  get is(): boolean {
    return this.options.range === undefined ? false : this.options.range;
  }

  get allYearsInterval(): string[] {
    const options = [];
    for (let i = this.initStartYear; i <= this.initEndYear; i++) {
      options.push(i);
    }
    return options;
  }

  constructor(private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('fr');
  }

  ngOnInit() {
    if (this.startDate === undefined) {
      this.startDate = new Date(this.min);
    }
    if (this.endDate === undefined) {
      this.endDate = new Date(this.max);
    }
    if (this.startYear === undefined) {
      this.startYear = new Date(this.startDate).getFullYear();
      this.initStartYear = this.startYear;
    }
    if (this.endYear === undefined) {
      this.endYear = new Date(this.endDate).getFullYear();
      this.initEndYear = this.endYear;
    }

    this.checkFilterValue();

    if (!this.isRange) {
      this.listYears = this.allYearsInterval;
    } else {
      this.setUpYearsInterval();
    }

    this.options.enabled =
      this.options.enabled === undefined ? true : this.options.enabled;
    if (this.options.enabled) {
      if (!this.isRange && this.style === 'slider' && this.type === 'year') {
        this.yearChange.emit(this.year);
      }
    } else {
      this.storeCurrentFilterValue();
      this.yearChange.emit(undefined); // TODO: FIX THIS for ALL OTHER TYPES STYLES OR RANGE.
    }
  }

  storeCurrentFilterValue() {
    // TODO: FIX THIS for ALL OTHER TYPES STYLES OR RANGE.
    if (
      !this.isRange &&
      this.style === TimeFilterStyle.SLIDER &&
      this.type === TimeFilterType.YEAR
    ) {
      this.options.value = this.year.toString();
    }
  }

  private processSliderValue() {
    // if style is Slider the range always false
    const dateValue = this.getDateValue();
    const inRange = dateValue
      ? isDateOrRangeInRange(dateValue, [this.min, this.max])
      : undefined;

    if (inRange && dateValue instanceof Date) {
      if (this.type === TimeFilterType.YEAR) {
        this.year = dateValue.getFullYear();
      } else {
        this.date = dateValue;
      }
    } else {
      if (this.type === TimeFilterType.YEAR) {
        this.year = this.min.getFullYear();
      } else {
        this.date = this.min;
      }
    }
  }

  private processCalendarYearType() {
    const dateValue = this.getDateValue();

    const inRange = dateValue
      ? isDateOrRangeInRange(dateValue, [this.min, this.max])
      : undefined;

    if (!this.isRange) {
      if (inRange && dateValue instanceof Date) {
        this.year = dateValue.getFullYear();
      } else {
        this.year = this.min.getFullYear();
      }
    } else {
      if (
        inRange &&
        Array.isArray(dateValue) &&
        dateValue[0].getFullYear() !== dateValue[1].getFullYear()
      ) {
        this.startYear = dateValue[0].getFullYear();
        this.endYear = dateValue[1].getFullYear();
      }
    }
  }

  private processCalendarDateType() {
    const dateValue = this.getDateValue();

    const inRange = dateValue
      ? isDateOrRangeInRange(dateValue, [this.min, this.max])
      : undefined;

    if (!this.isRange) {
      if (inRange && dateValue instanceof Date) {
        this.date = dateValue;
      } else {
        this.date = this.min;
      }
    } else {
      if (
        inRange &&
        Array.isArray(dateValue) &&
        dateValue[0] !== dateValue[1]
      ) {
        this.startDate = dateValue[0];
        this.endDate = dateValue[1];
      }
    }
  }

  private getDateValue(): Date | [min: Date, max: Date] | undefined {
    const olSource = this.layer.dataSource.ol as olSourceImageWMS;
    const timeFromWms = olSource.getParams().TIME
      ? parseDateString(String(olSource.getParams().TIME))
      : undefined;

    const dateValue =
      this.options.value && !timeFromWms
        ? parseDateString(this.options.value)
        : undefined;

    return timeFromWms ?? dateValue;
  }

  private checkCalendarValue() {
    if (this.type === TimeFilterType.YEAR) {
      this.processCalendarYearType();
    } else {
      this.processCalendarDateType();
    }
  }

  private checkFilterValue() {
    if (this.style === TimeFilterStyle.SLIDER) {
      this.processSliderValue();
    } else if (this.style === TimeFilterStyle.CALENDAR) {
      this.checkCalendarValue();
    }
  }

  handleDateChange() {
    this.setupDateOutput();
    this.applyTypeChange();

    // Only if is range, use 2 dates to make the range
    if (this.isRange) {
      this.dateChange.emit([this.startDate, this.endDate]);
    } else {
      this.dateChange.emit(this.startDate);
    }
  }

  handleYearChange() {
    if (this.isRange) {
      this.endListYears = [];
      this.startListYears = [];
      this.setUpYearsInterval();

      this.yearChange.emit([this.startYear, this.endYear]);
    } else {
      this.yearChange.emit(this.year);
    }
  }

  private setUpYearsInterval() {
    this.endListYears = this.allYearsInterval.slice(
      this.startYear + 1 - this.initStartYear
    );
    this.startListYears = this.allYearsInterval.slice(
      0,
      this.endYear - this.initStartYear
    );
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

    test.forEach((value) => {
      if (value.className === 'mat-slider-thumb-label-text') {
        thumbLabel = value;
      }

      if (value.children.length > 0 && !thumbLabel) {
        thumbLabel = this.findThumbLabel(value.childNodes);
      }
    }, this);
    return thumbLabel;
  }

  toggleFilterState() {
    this.options.enabled = !this.options.enabled;

    if (this.options.enabled) {
      if (
        !this.isRange &&
        TimeFilterStyle.SLIDER &&
        this.type === TimeFilterType.YEAR
      ) {
        this.yearChange.emit(this.year);
      }
    } else {
      this.stopFilter();
      this.storeCurrentFilterValue();
      this.dateChange.emit(undefined); // TODO: FIX THIS for ALL OTHER TYPES STYLES OR RANGE.
    }
  }

  resetFilter() {
    this.date = new Date(this.min);
    this.year = this.date.getFullYear();
    if (
      !this.isRange &&
      TimeFilterStyle.SLIDER &&
      this.type === TimeFilterType.YEAR
    ) {
      this.yearChange.emit(this.year);
    } else {
      this.setupDateOutput();
      this.dateChange.emit(undefined); // TODO: FIX THIS for ALL OTHER TYPES STYLES OR RANGE.
    }
  }

  playFilter() {
    if (this.interval) {
      this.stopFilter();
    } else {
      this.playIcon = 'pause_circle';
      this.interval = window.setInterval(
        (that) => {
          let newMinDateNumber;
          const maxDateNumber = new Date(that.max);

          newMinDateNumber =
            that.date === undefined ? that.min.getTime() : that.date.getTime();
          newMinDateNumber += that.mySlider.step;
          that.date = new Date(newMinDateNumber);

          if (newMinDateNumber > maxDateNumber.getTime()) {
            that.stopFilter();
          }

          that.handleDateChange();
        },
        this.timeInterval,
        this
      );
    }
  }

  playYear() {
    if (
      this.year + this.mySlider.step >
      this.max.getFullYear() + this.mySlider.step
    ) {
      this.stopFilter();
      this.resetFilter();
    }
    if (this.interval) {
      this.stopFilter();
    } else {
      this.playIcon = 'pause_circle';
      this.interval = setInterval(
        () => {
          if (this.year + this.mySlider.step > this.max.getFullYear()) {
            this.stopFilter();
          } else {
            this.year = this.year + this.mySlider.step;
          }
          this.yearChange.emit(this.year);
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
    this.playIcon = 'play_circle';
  }

  handleSliderDateChange(event: any) {
    const date = new Date(event.value);
    this.date = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    this.setSliderThumbLabel(this.handleSliderTooltip());
    this.handleDateChange();
  }

  handleSliderYearChange(event: any) {
    this.year = event.value;
    this.yearChange.emit(this.year);
  }

  handleSliderValue(): number {
    if (this.options.current === true || !this.min) {
      const currentDate = new Date();
      this.date = this.getRoundedDate(currentDate);
    }
    if (this.type === TimeFilterType.YEAR) {
      return this.year;
    } else {
      return this.date === undefined ? this.min.getTime() : this.date.getTime();
    }
  }

  handleSliderTooltip(): string {
    // 24h = 86400000 ms
    const oneDayMs = 86400000;
    const date = this.date === undefined ? this.min : this.date;
    switch (this.type) {
      case TimeFilterType.DATE:
        return this.step >= oneDayMs ? date.toDateString() : date.toUTCString();
      case TimeFilterType.TIME:
        return date.toTimeString();
      default:
        return this.date.toUTCString();
    }
  }

  setupDateOutput() {
    if (this.style === TimeFilterStyle.SLIDER) {
      this.startDate = new Date(this.date);
      this.endDate = new Date(this.startDate);
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
      case TimeFilterType.DATE:
        if (this.style === TimeFilterStyle.CALENDAR) {
          if (this.startDate !== undefined || this.endDate !== undefined) {
            this.startDate.setHours(0);
            this.startDate.setMinutes(0);
            this.startDate.setSeconds(0);
            this.endDate.setHours(23);
            this.endDate.setMinutes(59);
            this.endDate.setSeconds(59);
          }
        }
        break;
      case TimeFilterType.TIME:
        if (this.style === TimeFilterStyle.CALENDAR) {
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
   * Round date at a certain time, 10 minutes by Default
   * @param date - Date to Round
   * @param atMinute - round to closest 'atMinute' minute, rounded 10 by default
   * @return the rounded date
   */
  getRoundedDate(date, atMinute = 10) {
    const coeff = 1000 * 60 * atMinute;
    return new Date(Math.round(date.getTime() / coeff) * coeff);
  }

  /**
   * Get the step (period) definition from the layer dimension tag
   * @param step The step as ISO 8601 example: PT10M for 10 Minutes
   * @return the duration in milliseconds
   */
  getStepDefinition(step) {
    return moment.duration(step).asMilliseconds();
  }
}

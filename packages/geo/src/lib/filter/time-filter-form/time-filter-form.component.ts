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

  @Output() change = new EventEmitter<Date | [Date, Date]>();
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
      const min = new Date(this.options.min);
      return new Date(min.getTime() + min.getTimezoneOffset() * 60000);
    } else {
      return undefined;
    }
  }

  get max(): Date {
    if (this.options.max) {
      const max = new Date(this.options.max);
      return new Date(max.getTime() + max.getTimezoneOffset() * 60000);
    } else {
      return undefined;
    }
  }

  get is(): boolean {
    return this.options.range === undefined ? false : this.options.range;
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
    this.options.enabled =
      this.options.enabled === undefined ? true : this.options.enabled;
    this.checkFilterValue();
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

  checkFilterValue() {
    const olSource = this.layer.dataSource.ol as olSourceImageWMS;
    const timeFromWms = olSource.getParams().TIME;
    if (
      !this.isRange &&
      this.style === TimeFilterStyle.SLIDER &&
      this.type === TimeFilterType.YEAR
    ) {
      if (timeFromWms) {
        this.year = new Date(timeFromWms.toString()).getFullYear() + 1;
      } else if (this.options.value) {
        this.year = new Date(this.options.value.toString()).getFullYear() + 1;
      } else {
        this.year = new Date(this.min).getFullYear() + 1;
      }
    } else if (
      this.isRange &&
      this.style === TimeFilterStyle.CALENDAR &&
      this.type === TimeFilterType.YEAR
    ) {
      if (timeFromWms) {
        this.startYear = parseInt(timeFromWms.substr(0, 4), 10);
        this.endYear = parseInt(timeFromWms.substr(5, 4), 10);
        const newStartListYears: any[] = [];
        const newEndListYears: any[] = [];
        for (let i = this.initStartYear; i < this.endYear; i++) {
          newStartListYears.push(i);
        }
        for (let i = this.startYear + 1; i <= this.initEndYear; i++) {
          newEndListYears.push(i);
        }
        this.startListYears = newStartListYears;
        this.endListYears = newEndListYears;
      }
    }
    // TODO: FIX THIS for ALL OTHER TYPES STYLES OR RANGE.
  }

  handleDateChange() {
    this.setupDateOutput();
    this.applyTypeChange();

    // Only if is range, use 2 dates to make the range
    if (this.isRange) {
      this.change.emit([this.startDate, this.endDate]);
    } else {
      this.change.emit(this.startDate);
    }
  }

  handleYearChange() {
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

  handleListYearChange() {
    this.handleYearChange();
  }

  handleListYearStartChange() {
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
      this.change.emit(undefined); // TODO: FIX THIS for ALL OTHER TYPES STYLES OR RANGE.
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
      this.change.emit(undefined); // TODO: FIX THIS for ALL OTHER TYPES STYLES OR RANGE.
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
    this.date = new Date(event.value);
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

  handleSliderTooltip() {
    let label: string;

    switch (this.type) {
      case TimeFilterType.DATE:
        label =
          this.date === undefined
            ? this.min.toDateString()
            : this.date.toDateString();
        break;
      case TimeFilterType.TIME:
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
    if (this.style === TimeFilterStyle.SLIDER) {
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
      case TimeFilterType.DATE:
        if (this.startDate !== undefined || this.endDate !== undefined) {
          this.startDate.setHours(0);
          this.startDate.setMinutes(0);
          this.startDate.setSeconds(0);
          this.endDate.setHours(23);
          this.endDate.setMinutes(59);
          this.endDate.setSeconds(59);
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

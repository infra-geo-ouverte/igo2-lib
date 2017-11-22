import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MdSlider } from '@angular/material';
import { TimeFilterOptions } from '../shared';

@Component({
  selector: 'igo-time-filter-form',
  templateUrl: './time-filter-form.component.html',
  styleUrls: ['./time-filter-form.component.styl']
})
export class TimeFilterFormComponent {

  static formats = {
    date: 'y-MM-dd',
    time: 'HH:mm',
    datetime: 'y-MM-dd HH:mm:ss'
  };

  @Input()
  get options(): TimeFilterOptions { return this._options; }
  set options(value: TimeFilterOptions) {
    this._options = value;
  }
  private _options: TimeFilterOptions;

  public date: Date;
  @Input()
  set currentValue(value: string) {
    if (value) {
      const valueArray = value.split('/');
      if (valueArray.length > 0 ) {
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

  public startDate: Date;
  public endDate: Date;
  public interval: any;
  public playIcon: string = 'play_circle_filled';

  @Output() change: EventEmitter<Date | [Date | Date]> = new EventEmitter();
  @ViewChild(MdSlider) mySlider;

  get type(): 'date' | 'time' | 'datetime' {
    return this.options.type === undefined ?
      'date' : this.options.type;
  }

  get format(): string {
    return this.options.format === undefined ?
      TimeFilterFormComponent.formats[this.type] : this.options.format;
  }

  get isRange(): boolean {
    return this.options.range === undefined || this.options.style === 'slider' ?
      false : this.options.range;
  }

  get style(): string {
    return this.options.style === undefined ?
      'slider' : this.options.style;
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
        default:
          step = 10800000;
      }
    }else {
      step = this.options.step;
    }

    return step;
  }

  get timeInterval(): number {
    return this.options.timeInterval === undefined ?
      2000 : this.options.timeInterval;
  }

  get min(): Date {
    return this.options.min === undefined ?
      undefined : new Date(this.options.min);
  }

  get max(): Date {
    return this.options.max === undefined ?
      undefined : new Date(this.options.max);
  }

  get is(): boolean {
    return this.options.range === undefined ?
      false : this.options.range;
  }

  constructor() { }

  handleDateChange(event: any) {
    // Calendar throw handleDateChange when first selected with weird date
    if ( (event.source instanceof MdSlider) ||
        (event.source.date === event.source.value) ||
        (event.source.value === null) ) {

      this.setupDateOutput();
      this.applyTypeChange();
      this.change.emit([this.startDate, this.endDate]);
    }
  }

  dateToNumber(date: Date): number {
    let newDate;
    if (date) {
      newDate = new Date(date);
    }else {
      newDate = new Date(this.min);
    }

    return newDate.getTime();
  }

  setSliderThumbLabel(label: string) {
    const thumbLabel = this.findThumbLabel(this.mySlider._elementRef.nativeElement.childNodes);
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

       if ((value.children.length > 0 ) && (!thumbLabel)) {
         thumbLabel = this.findThumbLabel(value.childNodes);
       }
     }, this);
     return thumbLabel;
  }

  playFilter(event: any) {

    if (this.interval) {
      this.stopFilter();
    }else {
      this.playIcon = 'pause_circle_filled';
      this.interval = setInterval(function(that) {
        let newMinDateNumber;
        const maxDateNumber = new Date(that.max);

        newMinDateNumber = that.date === undefined ? that.min.getTime() : that.date.getTime();
        newMinDateNumber += that.mySlider.step;
        that.date = new Date(newMinDateNumber);

        if (newMinDateNumber > maxDateNumber.getTime()) {
          that.stopFilter();
        }

        that.handleDateChange({source: {value: that.date, date: that.date}});

      }, this.timeInterval, this);
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
    event.source.value = this.date;
    event.source.date = this.date;
    this.handleDateChange(event);
  }

  handleSliderValue(): number {
    return this.date ===  undefined ? this.min.getTime() : this.date.getTime();
  }

  handleSliderTooltip() {
    let label: string;

    switch (this.type) {
      case 'date':
        label = this.date === undefined ? this.min.toDateString() : this.date.toDateString();
        break;
      case 'time':
        label = this.date === undefined ? this.min.toTimeString() : this.date.toTimeString();
        break;
      // datetime
      default:
        label = this.date === undefined ? this.min.toUTCString() : this.date.toUTCString();
        break;
    }
    return label;
  }

  setupDateOutput() {
    if (this.style === 'slider') {
       this.startDate = new Date(this.date);
       this.startDate.setSeconds(-(this.step / 1000));
       this.endDate = new Date(this.startDate);
       this.endDate.setSeconds((this.step / 1000));
    } else if ((!this.isRange) && (this.date !== null)) {
      this.endDate = new Date(this.date);
      this.startDate = new Date(this.date);
    } else if ((this.isRange) && ((this.date !== null)  || (this.date == null))) {
      this.startDate = this.startDate === undefined ? new Date(this.min) : this.startDate;
      this.endDate = this.endDate === undefined ? new Date(this.max) : this.endDate;
    } else if ((!this.isRange) && (this.date == null)) {
      this.startDate = undefined;
      this.endDate = undefined;
    }
  }

  applyTypeChange() {
    switch (this.type) {
      case 'date':
        if ( this.startDate !== undefined || this.endDate !== undefined ) {
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

        if (!this.isRange) {
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

}

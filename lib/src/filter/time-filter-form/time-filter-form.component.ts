import { Component, Input, Output, EventEmitter } from '@angular/core';

import { TimeFilterOptions } from '../shared';

@Component({
  selector: 'igo-time-filter-form',
  templateUrl: './time-filter-form.component.html',
  styleUrls: ['./time-filter-form.component.styl']
})
export class TimeFilterFormComponent {

  static formats = {
    date: 'y/MM/dd',
    time: 'HH:mm',
    datetime: 'y/MM/dd HH:mm'
  };

  @Input()
  get options(): TimeFilterOptions { return this._options; }
  set options(value: TimeFilterOptions) {
    this._options = value;
  }
  private _options: TimeFilterOptions;

  public date: Date;
  public startDate: Date;
  public endDate: Date;

  @Output() change: EventEmitter<Date | [Date | Date]> = new EventEmitter();

  get type(): 'date' | 'time' | 'datetime' {
    return this.options.type === undefined ?
      'date' : this.options.type;
  }

  get format(): string {
    return this.options.format === undefined ?
      TimeFilterFormComponent.formats[this.type] : this.options.format;
  }

  get isRange(): boolean {
    return this.options.range === undefined ?
      false : this.options.range;
  }

  get min(): Date {
    return this.options.min === undefined ?
      undefined : new Date(this.options.min);
  }

  get max(): Date {
    return this.options.max === undefined ?
      undefined : new Date(this.options.max);
  }

  constructor() { }

  handleDateChange(event: any) {
    if (this.isRange) {
      this.change.emit([this.startDate, this.endDate]);
    } else {
      this.change.emit(this.date);
    }
  }
}

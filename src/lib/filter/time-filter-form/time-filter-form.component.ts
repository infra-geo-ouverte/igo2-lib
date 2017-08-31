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
  public interval: any;

  @Output() change: EventEmitter<Date | [Date | Date]> = new EventEmitter();

  @ViewChild(MdSlider) mySlider;
  @ViewChild("playFilterIcon") playFilterIcon;

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
      'calendar' : this.options.style;
  }

  get step(): string {
    return this.options.step === undefined ? 
      '86400000' : this.options.step;
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
    if (this.isRange) {
      this.change.emit([this.startDate, this.endDate]);
    } else {
      this.change.emit(this.date);
    }    
  }

  dateToNumber(date: Date): number{
    let newDate;
    if(date){
      newDate = new Date(date);
    }else{
      newDate = new Date(this.min);
    }

    return newDate.getTime();
  }

   numberToDate(date: number): String{
    let newDate;
    if(date){
      newDate = new Date(date);
      newDate = newDate.toLocaleString();
    }else{
      newDate = new Date(this.min);
      newDate = newDate.toLocaleString(); 
    }
    return newDate;
  }

  setSliderThumbLabel(label: string){
    var thumbLabel = this.findThumbLabel(this.mySlider._elementRef.nativeElement.childNodes);
    if(thumbLabel){
      thumbLabel.textContent = label;
    }
  }

  findThumbLabel(test: any[]): any{
     let thumbLabel;

     test.forEach(value => {
        
       if(value.className === 'mat-slider-thumb-label-text'){
         thumbLabel = value;
       }

       if((value.children.length > 0 )&& (!thumbLabel)){
         thumbLabel = this.findThumbLabel(value.childNodes)
       }
     }, this);
     return thumbLabel;
  }

  playFilter(event: any){

    if(this.interval){
      this.stopFilter();
    }else{
      
      this.playFilterIcon.nativeElement.textContent = 'pause_circle_filled';
      
      this.interval = setInterval(function(that){
        
        let newMinDateNumber;
        let maxDateNumber = new Date(that.max);
    
        newMinDateNumber = that.date === undefined ? that.min.getTime() : that.date.getTime();
        newMinDateNumber += that.mySlider.step;
        that.date = new Date(newMinDateNumber);
       
        if(newMinDateNumber > maxDateNumber.getTime()){
          that.stopFilter();
        }
              
        that.handleDateChange({});
        
      }, this.timeInterval, this)
    }
  }

  stopFilter(){
    clearInterval(this.interval.data.handleId);
    this.interval=undefined;
    this.playFilterIcon.nativeElement.textContent = "play_circle_filled";
  }

  handleSliderDateChange(event: any) {

    this.date = new Date(event.value);
    this.setSliderThumbLabel(this.handleSliderTooltip());
    this.handleDateChange({});
  }

  handleSliderValue(): number{
    return this.date ===  undefined ? this.min.getTime() : this.date.getTime();
  }

  handleSliderTooltip(){
    let label:string;

    switch (this.type) {
      case "date":
        label = this.date === undefined ? this.min.toDateString() : this.date.toDateString();
        break;
      case "time":
        label = this.date === undefined ? this.min.toTimeString() : this.date.toTimeString();
        break;
      //datetime      
      default:
        label = this.date === undefined ? this.min.toUTCString() : this.date.toUTCString();
        break;
    }
    return label;
  }

}

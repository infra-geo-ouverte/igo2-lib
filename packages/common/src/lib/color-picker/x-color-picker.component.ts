import { Component, forwardRef } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import tinycolor from "tinycolor2";

@Component({
  selector: 'igo-x-color-picker',
  templateUrl: './x-color-picker.component.html',
  styleUrls: ['./x-color-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => XcolorPickerComponent),
      multi: true,
    }
  ]
})
export class XcolorPickerComponent implements ControlValueAccessor {

  @Input() color: string;
  @Input() setAlpha: '.4' | '1' = '.4';
  @Input() outputFormat: 'hex'| 'rgba'| 'hsla' = 'rgba';
  @Output() colorClick = new EventEmitter<null>();
  @Output() colorClose = new EventEmitter<null>();

  onChange: any = () => {};
  onTouch: any = () => {};
  val= "";

  set value(val){
    if( val !== undefined && this.val !== val){
      val = this.setFormat(val);
      this.val = val;
      this.onChange(val);
      this.onTouch(val);
    } else {
      this.val = this.color;
    }
  }

  get value () {
    return tinycolor(this.color).setAlpha(this.setAlpha).toHexString();
  }

  constructor() { }

  writeValue(value: any){
    this.value = value;
  }

  registerOnChange(fn: any){
    this.onChange = fn;
  }

  registerOnTouched(fn: any){
    this.onTouch = fn;
  }

  setFormat(color: string): string {
    switch (this.outputFormat) {
      case 'hex':
        color = tinycolor(color).setAlpha(this.setAlpha).toHexString();
      break;
      case 'rgba':
      color = tinycolor(color).setAlpha(this.setAlpha).toRgbString();
      break;
      case 'hsla':
      color = tinycolor(color).setAlpha(this.setAlpha).toHsvString();
      break;
      default:
        color = tinycolor(color).setAlpha(this.setAlpha).toRgbString();
      break;
    }
    return color;
  }
}

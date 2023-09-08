import { Component, forwardRef } from '@angular/core';
import { Input, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import tinycolor from "tinycolor2";

@Component({
  selector: 'igo-color-picker-form-field',
  templateUrl: './color-picker-form-field.component.html',
  styleUrls: ['./color-picker-form-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerFormFieldComponent),
      multi: true,
    }
  ]
})
export class ColorPickerFormFieldComponent implements ControlValueAccessor {

  @Input() setAlpha: number = 1;
  @Input() outputFormat: 'hex'| 'rgba'| 'hsla' = 'rgba';
  @Output() colorClick = new EventEmitter<null>();
  @Output() colorClose = new EventEmitter<null>();

  onChange: any = () => {};
  onTouch: any = () => {};

  set value(value: string) {
    /*if( val !== undefined && this.val !== val){
      val = this.setFormat(val);
      this.val = val;
      this.onChange(val);
      this.onTouch(val);
    } else {
      this.val = this.color;
    }*/
    value = this.setFormat(value);
    this.onChange(value);
    this.onTouch(value);
    // console.log('aaa', value);
    this._value = value;
  }

  get value (): string {
    return this._value;
    // return tinycolor(this.color).setAlpha(this.setAlpha).toHexString();
  }

  public _value: string = "";

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

  private setFormat(color: string): string {
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

  hexFormt(): string {
    return tinycolor(this.value).toHexString();
  }
}

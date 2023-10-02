import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  forwardRef
} from '@angular/core';
import { Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import tinycolor from 'tinycolor2';

@Component({
  selector: 'igo-color-picker-form-field',
  templateUrl: './color-picker-form-field.component.html',
  styleUrls: ['./color-picker-form-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerFormFieldComponent),
      multi: true
    }
  ]
})
export class ColorPickerFormFieldComponent
  implements ControlValueAccessor, OnInit
{
  // native color picker can't give transparency
  // set transparency manually
  @Input() setAlpha: number = 1;

  // by default native color picker gives hex result
  @Input() outputFormat: 'hex' | 'rgba' | 'hsla' = 'rgba';

  // default color
  @Input() color: string = '#000';

  // open and close native color picker event
  @Output() open = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<boolean>();

  onChange: any = () => {};
  onTouch: any = () => {};

  // final value we get as result with custom format
  set value(value: string) {
    value = !value ? this.color : value;
    this.onChange(value);
    this.onTouch(value);
    this._value = value;
  }
  get value(): string {
    return this._value;
  }
  public _value: string;

  // native color picker accept hex format
  set hexColor(value: string) {
    this.value = this.setFormat(value);
    this._hexColor = value;
  }
  get hexColor(): string {
    return this._hexColor;
  }
  public _hexColor: string;

  ngOnInit(): void {
    if (this.color) {
      this._hexColor = tinycolor(this.color)
        .setAlpha(this.setAlpha)
        .toHexString();
    }
  }

  writeValue(value: string) {
    this.value = value;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
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

  closePicker() {
    setTimeout(() => {
      this.close.emit(true);
    }, 300);
  }
}

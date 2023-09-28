import { Component, Input, forwardRef, OnInit } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ColorEvent } from 'ngx-color';
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
  isOpen: boolean = false;

  set value(value: string) {
    this.onChange(value);
    this.onTouch(value);
    this._value = value;
  }
  get value(): string {
    return this._value;
  }
  private _value: string;

  // default format
  @Input() outputFormat: 'hex' | 'rgba' | 'hsla' = 'rgba';
  // default color
  @Input()
  set color(color: string) {
    this._color = color;
  }
  get color(): string {
    return this._color;
  }
  private _color: string;

  onChange: any = () => {};
  onTouch: any = () => {};

  ngOnInit(): void {
    this.color = !this.color
      ? this.setColorFormat('#000')
      : this.setColorFormat(this.color);
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

  applyClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isOpen = false;
    this.value = this.color;
  }

  handleChange($event: ColorEvent) {
    this.color = this.setColorFormat(tinycolor($event.color.rgb).toRgbString());
  }

  setColorFormat(color: string): string {
    switch (this.outputFormat) {
      case 'hex':
        color = tinycolor(color).toHexString();
        break;
      case 'rgba':
        color = tinycolor(color).toRgbString();
        break;
      case 'hsla':
        color = tinycolor(color).toHsvString();
        break;
      default:
        color = tinycolor(color).toRgbString();
        break;
    }
    return color;
  }
}

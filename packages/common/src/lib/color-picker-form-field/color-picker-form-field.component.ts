import { Component, Input, forwardRef } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ColorEvent } from 'ngx-color';
import tinycolor, { ColorInput } from 'tinycolor2';

type ColorFormat = 'hex' | 'rgba' | 'hsla';

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
export class ColorPickerFormFieldComponent implements ControlValueAccessor {
  isOpen: boolean = false;

  set value(value: string) {
    this._value = this.formatColor(value ?? '#000');
    if (this.colorPicker == null || this.colorPicker !== this._value) {
      this.colorPicker = this._value;
    }

    this.onChange(this.value);
    this.onTouch(this.value);
  }
  get value(): string {
    return this._value;
  }
  private _value: string;

  @Input() outputFormat: ColorFormat = 'rgba';

  colorPicker: string;

  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: string) {
    this.value = value;
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isOpen = false;
    this.value = this.colorPicker;
  }

  handleChange($event: ColorEvent) {
    this.colorPicker = this.formatColor($event.color.rgb, 'rgba');
  }

  formatColor(
    color: ColorInput,
    format: ColorFormat = this.outputFormat
  ): string {
    switch (format) {
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

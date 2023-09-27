import { Component, Input, forwardRef } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Color, ColorPickerControl } from '@iplab/ngx-color-picker';
// import tinycolor from 'tinycolor2';
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
  colorControl = new ColorPickerControl().hidePresets();

  set value(value: string) {
    this.onChange(value);
    this.onTouch(value);
    this._value = value;
  }
  get value(): string {
    return this._value;
  }
  private _value: string;

  private _color: Color = null;
  // default color
  @Input()
  public set color(color: string) {
    this.colorControl.setValueFrom(color);
    this._color = this.colorControl.value;
  }

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

  applyClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isOpen = false;
    this._color = this.colorControl.value;
    this.value = this.colorControl.value.toRgbaString();
  }
}

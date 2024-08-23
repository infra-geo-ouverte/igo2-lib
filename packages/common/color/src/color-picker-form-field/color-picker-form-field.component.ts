import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { IgoLanguageModule } from '@igo2/core/language';

import { ColorEvent } from 'ngx-color';
import { ColorChromeModule } from 'ngx-color/chrome';
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
  ],
  standalone: true,
  imports: [
    MatFormFieldModule,
    CdkOverlayOrigin,
    MatInputModule,
    CdkConnectedOverlay,
    ColorChromeModule,
    MatButtonModule,
    IgoLanguageModule
  ]
})
export class ColorPickerFormFieldComponent implements ControlValueAccessor {
  isOpen = false;

  set value(value: string) {
    this._value = this.formatColor(value ?? '#000');
    this.colorPicker = this._value;

    this.onChange(this.value);
    this.onTouch(this.value);
  }
  get value(): string {
    return this._value;
  }
  private _value: string;

  @Input() outputFormat: ColorFormat = 'rgba';

  /**
   * The emitted value represent the current chosen color in the picker
   * The value is emitted by default in RGBA, or based on the input 'outputFormat' value.
   */
  @Output() colorChange: EventEmitter<string> = new EventEmitter<string>();

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
    this.colorChange.emit(this.formatColor(this.colorPicker));
  }

  private formatColor(
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

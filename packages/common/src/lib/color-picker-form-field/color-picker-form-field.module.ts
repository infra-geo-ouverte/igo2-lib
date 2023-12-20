import { NgModule } from '@angular/core';

import { ColorPickerFormFieldComponent } from './color-picker-form-field.component';

/**
 * @deprecated import the ColorPickerFormFieldComponent directly
 */
@NgModule({
  imports: [ColorPickerFormFieldComponent],
  exports: [ColorPickerFormFieldComponent]
})
export class ColorPickerFormFieldModule {}

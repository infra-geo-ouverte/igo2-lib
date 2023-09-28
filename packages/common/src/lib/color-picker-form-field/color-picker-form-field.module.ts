import { NgModule } from '@angular/core';
import { ColorPickerFormFieldComponent } from './color-picker-form-field.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { ColorChromeModule } from 'ngx-color/chrome';

@NgModule({
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    OverlayModule,
    ColorChromeModule
  ],
  declarations: [ColorPickerFormFieldComponent],
  exports: [ColorPickerFormFieldComponent]
})
export class ColorPickerFormFieldModule {}

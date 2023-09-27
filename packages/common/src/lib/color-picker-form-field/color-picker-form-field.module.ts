import { NgModule } from '@angular/core';
import { ColorPickerFormFieldComponent } from './color-picker-form-field.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ColorPickerModule } from '@iplab/ngx-color-picker';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    ColorPickerModule,
    CommonModule,
    OverlayModule
  ],
  declarations: [ColorPickerFormFieldComponent],
  exports: [ColorPickerFormFieldComponent]
})
export class ColorPickerFormFieldModule {}

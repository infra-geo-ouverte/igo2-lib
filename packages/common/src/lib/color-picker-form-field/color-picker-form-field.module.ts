import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { ColorChromeModule } from 'ngx-color/chrome';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

import { ColorPickerFormFieldComponent } from './color-picker-form-field.component';

@NgModule({
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    OverlayModule,
    ColorChromeModule,
    TranslateModule
  ],
  declarations: [ColorPickerFormFieldComponent],
  exports: [ColorPickerFormFieldComponent]
})
export class ColorPickerFormFieldModule {}

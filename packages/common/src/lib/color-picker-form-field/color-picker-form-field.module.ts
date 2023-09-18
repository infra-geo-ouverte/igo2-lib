import { NgModule } from '@angular/core';
import { ColorPickerFormFieldComponent } from './color-picker-form-field.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from '@angular/material/input';

@NgModule({
    imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule
    ],
    declarations: [ColorPickerFormFieldComponent],
    exports: [ColorPickerFormFieldComponent]
  })
  export class ColorPickerFormFieldModule {

  }

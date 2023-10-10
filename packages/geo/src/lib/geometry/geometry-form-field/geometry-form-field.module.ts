import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { IgoLanguageModule } from '@igo2/core';

import { GeometryFormFieldComponent } from './geometry-form-field.component';
import { GeometryFormFieldInputComponent } from './geometry-form-field-input.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    IgoLanguageModule
  ],
  exports: [GeometryFormFieldComponent, GeometryFormFieldInputComponent],
  declarations: [GeometryFormFieldComponent, GeometryFormFieldInputComponent]
})
export class IgoGeometryFormFieldModule {}

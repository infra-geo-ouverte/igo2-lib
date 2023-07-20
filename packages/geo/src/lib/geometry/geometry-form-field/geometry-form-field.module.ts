import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';

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
  exports: [
    GeometryFormFieldComponent,
    GeometryFormFieldInputComponent
  ],
  declarations: [
    GeometryFormFieldComponent,
    GeometryFormFieldInputComponent
  ]
})
export class IgoGeometryFormFieldModule {}

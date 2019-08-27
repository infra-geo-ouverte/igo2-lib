import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatIconModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule
} from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoDynamicOutletModule } from '../../dynamic-component/dynamic-outlet/dynamic-outlet.module';

import { FormFieldComponent } from './form-field.component';
import { FormFieldSelectComponent } from './form-field-select.component';
import { FormFieldTextComponent } from './form-field-text.component';
import { FormFieldTextareaComponent } from './form-field-textarea.component';

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
    MatSelectModule,
    IgoLanguageModule,
    IgoDynamicOutletModule
  ],
  exports: [
    FormFieldComponent,
    FormFieldSelectComponent,
    FormFieldTextComponent,
    FormFieldTextareaComponent
  ],
  declarations: [
    FormFieldComponent,
    FormFieldSelectComponent,
    FormFieldTextComponent,
    FormFieldTextareaComponent
  ]
})
export class IgoFormFieldModule {}

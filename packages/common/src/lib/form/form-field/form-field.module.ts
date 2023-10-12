import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { IgoLanguageModule } from '@igo2/core';

import { IgoDynamicOutletModule } from '../../dynamic-component/dynamic-outlet/dynamic-outlet.module';
import { FormFieldSelectComponent } from './form-field-select.component';
import { FormFieldTextComponent } from './form-field-text.component';
import { FormFieldTextareaComponent } from './form-field-textarea.component';
import { FormFieldComponent } from './form-field.component';

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

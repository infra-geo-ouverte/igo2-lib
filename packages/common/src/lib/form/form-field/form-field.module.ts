import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

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

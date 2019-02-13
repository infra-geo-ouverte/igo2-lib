import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLibFormFormModule } from './form/form.module';
import { IgoLibFormGroupModule } from './form-group/form-group.module';
import { IgoLibFormFieldModule } from './form-field/form-field.module';
import { FormFieldSelectComponent } from './form-field/form-field-select.component';
import { FormFieldTextComponent } from './form-field/form-field-text.component';
import { FormService } from './shared/form.service';
import { FormFieldService } from './shared/form-field.service';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoLibFormGroupModule,
    IgoLibFormFieldModule
  ],
  exports: [
    IgoLibFormFormModule,
    IgoLibFormGroupModule,
    IgoLibFormFieldModule
  ],
  declarations: [],
  providers: [
    FormService,
    FormFieldService
  ],
  entryComponents: [
    FormFieldSelectComponent,
    FormFieldTextComponent
  ]
})
export class IgoLibFormModule {}

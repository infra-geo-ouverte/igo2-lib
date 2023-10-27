import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { IgoFormFieldModule } from './form-field/form-field.module';
import { IgoFormGroupModule } from './form-group/form-group.module';
import { IgoFormFormModule } from './form/form.module';
import { FormFieldService } from './shared/form-field.service';
import { FormService } from './shared/form.service';

/**
 * @ignore
 */
@NgModule({
  imports: [CommonModule, IgoFormGroupModule, IgoFormFieldModule],
  exports: [IgoFormFormModule, IgoFormGroupModule, IgoFormFieldModule],
  declarations: [],
  providers: [FormService, FormFieldService]
})
export class IgoFormModule {}

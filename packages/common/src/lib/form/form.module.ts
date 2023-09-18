import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoFormFormModule } from './form/form.module';
import { IgoFormGroupModule } from './form-group/form-group.module';
import { IgoFormFieldModule } from './form-field/form-field.module';
import { FormService } from './shared/form.service';
import { FormFieldService } from './shared/form-field.service';

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

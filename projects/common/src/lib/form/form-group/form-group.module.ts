import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material';

import { IgoFormFieldModule } from '../form-field/form-field.module';
import { FormGroupComponent } from './form-group.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    IgoFormFieldModule
  ],
  exports: [
    FormGroupComponent
  ],
  declarations: [
    FormGroupComponent
  ]
})
export class IgoFormGroupModule {}

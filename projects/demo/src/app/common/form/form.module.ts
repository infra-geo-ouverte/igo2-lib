import { NgModule } from '@angular/core';

import { IgoFormModule } from '@igo2/common';

import { SharedModule } from '../../shared/shared.module';
import { AppFormRoutingModule } from './form-routing.module';
import { AppFormComponent } from './form.component';

@NgModule({
  imports: [
    SharedModule,
    AppFormRoutingModule,
    IgoFormModule,
    AppFormComponent
  ],
  exports: [AppFormComponent]
})
export class AppFormModule {}

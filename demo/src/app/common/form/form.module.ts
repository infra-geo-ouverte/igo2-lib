import { NgModule } from '@angular/core';

import { IgoFormModule } from '@igo2/common';

import { AppFormComponent } from './form.component';
import { AppFormRoutingModule } from './form-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppFormComponent],
  imports: [SharedModule, AppFormRoutingModule, IgoFormModule],
  exports: [AppFormComponent]
})
export class AppFormModule {}

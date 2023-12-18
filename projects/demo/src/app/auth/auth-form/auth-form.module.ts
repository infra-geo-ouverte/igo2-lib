import { NgModule } from '@angular/core';

import { IgoAuthModule } from '@igo2/auth';

import { SharedModule } from '../../shared/shared.module';
import { AppAuthFormRoutingModule } from './auth-form-routing.module';
import { AppAuthFormComponent } from './auth-form.component';

@NgModule({
  imports: [
    AppAuthFormRoutingModule,
    SharedModule,
    IgoAuthModule.forRoot(),
    AppAuthFormComponent
  ],
  exports: [AppAuthFormComponent]
})
export class AppAuthFormModule {}

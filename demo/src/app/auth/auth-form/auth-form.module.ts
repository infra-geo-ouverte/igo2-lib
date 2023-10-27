import { NgModule } from '@angular/core';

import { IgoAuthModule } from '@igo2/auth';

import { SharedModule } from '../../shared/shared.module';
import { AppAuthFormRoutingModule } from './auth-form-routing.module';
import { AppAuthFormComponent } from './auth-form.component';

@NgModule({
  declarations: [AppAuthFormComponent],
  imports: [AppAuthFormRoutingModule, SharedModule, IgoAuthModule.forRoot()],
  exports: [AppAuthFormComponent]
})
export class AppAuthFormModule {}

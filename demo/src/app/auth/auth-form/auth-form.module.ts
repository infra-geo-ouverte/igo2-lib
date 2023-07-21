import { NgModule } from '@angular/core';

import { IgoAuthModule } from '@igo2/auth';

import { AppAuthFormComponent } from './auth-form.component';
import { AppAuthFormRoutingModule } from './auth-form-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppAuthFormComponent],
  imports: [AppAuthFormRoutingModule, SharedModule, IgoAuthModule.forRoot()],
  exports: [AppAuthFormComponent]
})
export class AppAuthFormModule {}

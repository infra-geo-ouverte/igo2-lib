import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material';

import { IgoAuthModule } from '@igo2/auth';

import { AppAuthFormComponent } from './auth-form.component';
import { AppAuthFormRoutingModule } from './auth-form-routing.module';

@NgModule({
  declarations: [AppAuthFormComponent],
  imports: [AppAuthFormRoutingModule, MatCardModule, IgoAuthModule],
  exports: [AppAuthFormComponent]
})
export class AppAuthFormModule {}

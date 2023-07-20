import { NgModule } from '@angular/core';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { IgoAuthModule } from '@igo2/auth';

import { AppAuthFormComponent } from './auth-form.component';
import { AppAuthFormRoutingModule } from './auth-form-routing.module';

@NgModule({
  declarations: [AppAuthFormComponent],
  imports: [AppAuthFormRoutingModule, MatCardModule, IgoAuthModule.forRoot()],
  exports: [AppAuthFormComponent]
})
export class AppAuthFormModule {}

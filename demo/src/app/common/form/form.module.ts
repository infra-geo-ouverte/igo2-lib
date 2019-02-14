import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatCardModule } from '@angular/material';

import { IgoFormModule } from '@igo2/common';

import { AppFormComponent } from './form.component';
import { AppFormRoutingModule } from './form-routing.module';

@NgModule({
  declarations: [AppFormComponent],
  imports: [
    CommonModule,
    AppFormRoutingModule,
    MatButtonModule,
    MatCardModule,
    IgoFormModule
  ],
  exports: [AppFormComponent]
})
export class AppFormModule {}

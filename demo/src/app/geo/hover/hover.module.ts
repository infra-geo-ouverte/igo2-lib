import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

import { IgoMapModule } from '@igo2/geo';

import { AppHoverComponent } from './hover.component';
import { AppHoverRoutingModule } from './hover-routing.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AppHoverComponent],
  imports: [
    CommonModule,
    AppHoverRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoMapModule
  ],
  exports: [AppHoverComponent]
})
export class AppHoverModule {}

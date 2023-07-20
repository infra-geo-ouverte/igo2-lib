import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';

import { IgoPanelModule } from '@igo2/common';
import {
  IgoMapModule,
  IgoOverlayModule,
  IgoQueryModule,
  IgoFeatureModule
} from '@igo2/geo';

import { AppQueryComponent } from './query.component';
import { AppQueryRoutingModule } from './query-routing.module';

@NgModule({
  declarations: [AppQueryComponent],
  imports: [
    AppQueryRoutingModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoMapModule,
    IgoOverlayModule,
    IgoQueryModule,
    IgoFeatureModule
  ],
  exports: [AppQueryComponent]
})
export class AppQueryModule {}

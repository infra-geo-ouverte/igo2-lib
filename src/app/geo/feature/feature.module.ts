import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';

import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoOverlayModule, IgoFeatureModule } from '@igo2/geo';

import { AppFeatureComponent } from './feature.component';
import { AppFeatureRoutingModule } from './feature-routing.module';

@NgModule({
  declarations: [AppFeatureComponent],
  imports: [
    AppFeatureRoutingModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoMapModule,
    IgoOverlayModule,
    IgoFeatureModule
  ],
  exports: [AppFeatureComponent]
})
export class AppFeatureModule {}

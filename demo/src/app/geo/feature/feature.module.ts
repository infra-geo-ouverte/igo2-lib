import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatCardModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';

import { IgoCoreModule } from '@igo2/core';
import { IgoPanelModule, IgoEntityTableModule } from '@igo2/common';
import { IgoMapModule, IgoFeatureModule } from '@igo2/geo';

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
    IgoCoreModule,
    IgoPanelModule,
    IgoEntityTableModule,
    IgoMapModule,
    IgoFeatureModule
  ],
  exports: [AppFeatureComponent]
})
export class AppFeatureModule {}

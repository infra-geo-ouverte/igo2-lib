import { NgModule } from '@angular/core';
import {
  MatCardModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';

import { IgoPanelModule } from '@igo2/common';
import {
  IgoMapModule,
  IgoLayerModule,
  IgoMetadataModule,
  IgoOverlayModule,
  IgoQueryModule,
  IgoFeatureModule
} from '@igo2/geo';
import { IgoContextManagerModule } from '@igo2/context';

import { AppContextComponent } from './context.component';
import { AppContextRoutingModule } from './context-routing.module';

@NgModule({
  declarations: [AppContextComponent],
  imports: [
    AppContextRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoMapModule,
    IgoLayerModule,
    IgoMetadataModule,
    IgoOverlayModule,
    IgoQueryModule,
    IgoFeatureModule,
    IgoContextManagerModule
  ],
  exports: [AppContextComponent]
})
export class AppContextModule {}

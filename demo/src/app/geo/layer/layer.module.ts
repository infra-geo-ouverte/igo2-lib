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
  IgoDownloadModule
} from '@igo2/geo';

import { AppLayerComponent } from './layer.component';
import { AppLayerRoutingModule } from './layer-routing.module';

@NgModule({
  declarations: [AppLayerComponent],
  imports: [
    AppLayerRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoMapModule,
    IgoLayerModule,
    IgoMetadataModule,
    IgoDownloadModule
  ],
  exports: [AppLayerComponent]
})
export class AppLayerModule {}

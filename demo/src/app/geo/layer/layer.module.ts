import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { IgoPanelModule } from '@igo2/common';
import {
  IgoDownloadModule,
  IgoFilterModule,
  IgoLayerModule,
  IgoMapModule,
  IgoMetadataModule
} from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppLayerRoutingModule } from './layer-routing.module';
import { AppLayerComponent } from './layer.component';

@NgModule({
  declarations: [AppLayerComponent],
  imports: [
    SharedModule,
    AppLayerRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    IgoPanelModule,
    IgoMapModule,
    IgoLayerModule,
    IgoFilterModule,
    IgoMetadataModule,
    IgoDownloadModule
  ],
  exports: [AppLayerComponent]
})
export class AppLayerModule {}

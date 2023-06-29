import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';

import { IgoPanelModule } from '@igo2/common';
import {
  IgoMapModule,
  IgoLayerModule,
  IgoFilterModule,
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
    IgoFilterModule,
    IgoMetadataModule,
    IgoDownloadModule
  ],
  exports: [AppLayerComponent]
})
export class AppLayerModule {}

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

import { AppLegendComponent } from './legend.component';
import { AppLegendRoutingModule } from './legend-routing.module';

@NgModule({
  declarations: [AppLegendComponent],
  imports: [
    AppLegendRoutingModule,
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
  exports: [AppLegendComponent]
})
export class AppLegendModule {}

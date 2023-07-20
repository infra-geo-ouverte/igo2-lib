import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientJsonpModule } from '@angular/common/http';
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
    HttpClientJsonpModule,
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

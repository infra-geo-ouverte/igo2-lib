import { NgModule } from '@angular/core';
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
import { IgoContextModule } from '@igo2/context';

import { AppContextComponent } from './context.component';
import { AppContextRoutingModule } from './context-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppContextComponent],
  imports: [
    HttpClientJsonpModule,
    AppContextRoutingModule,
    SharedModule,
    IgoPanelModule,
    IgoMapModule,
    IgoLayerModule,
    IgoMetadataModule,
    IgoOverlayModule,
    IgoQueryModule,
    IgoFeatureModule,
    IgoContextModule
  ],
  exports: [AppContextComponent]
})
export class AppContextModule {}

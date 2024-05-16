import { HttpClientJsonpModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { IgoPanelModule } from '@igo2/common/panel';
import { IgoContextModule } from '@igo2/context';
import {
  IgoFeatureModule,
  IgoLayerModule,
  IgoMapModule,
  IgoMetadataModule,
  IgoOverlayModule,
  IgoQueryModule
} from '@igo2/geo';

import { AppContextRoutingModule } from './context-routing.module';
import { AppContextComponent } from './context.component';

@NgModule({
  imports: [
    HttpClientJsonpModule,
    AppContextRoutingModule,
    IgoPanelModule,
    IgoMapModule,
    IgoLayerModule,
    IgoMetadataModule,
    IgoOverlayModule,
    IgoQueryModule,
    IgoFeatureModule,
    IgoContextModule,
    AppContextComponent
  ],
  exports: [AppContextComponent]
})
export class AppContextModule {}

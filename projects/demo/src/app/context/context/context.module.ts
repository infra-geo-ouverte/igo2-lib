import { HttpClientJsonpModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { IgoPanelModule } from '@igo2/common';
import { IgoContextModule } from '@igo2/context';
import {
  IgoFeatureModule,
  IgoLayerModule,
  IgoMapModule,
  IgoMetadataModule,
  IgoOverlayModule,
  IgoQueryModule
} from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppContextRoutingModule } from './context-routing.module';
import { AppContextComponent } from './context.component';

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

import { NgModule } from '@angular/core';
import { MatCardModule, MatButtonModule } from '@angular/material';

import { IgoPanelModule } from '@igo2/common';
import { IgoMapModule, IgoLayerModule } from '@igo2/geo';

import { AppLayerComponent } from './layer.component';
import { AppLayerRoutingModule } from './layer-routing.module';

@NgModule({
  declarations: [AppLayerComponent],
  imports: [
    AppLayerRoutingModule,
    MatCardModule,
    MatButtonModule,
    IgoPanelModule,
    IgoMapModule,
    IgoLayerModule
  ],
  exports: [AppLayerComponent]
})
export class AppLayerModule {}

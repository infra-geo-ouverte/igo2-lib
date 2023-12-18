import { NgModule } from '@angular/core';

import { IgoEntityTableModule, IgoPanelModule } from '@igo2/common';
import { IgoFeatureModule, IgoMapModule } from '@igo2/geo';

import { SharedModule } from '../../shared/shared.module';
import { AppFeatureRoutingModule } from './feature-routing.module';
import { AppFeatureComponent } from './feature.component';

@NgModule({
  imports: [
    SharedModule,
    AppFeatureRoutingModule,
    IgoPanelModule,
    IgoEntityTableModule,
    IgoMapModule,
    IgoFeatureModule,
    AppFeatureComponent
  ],
  exports: [AppFeatureComponent]
})
export class AppFeatureModule {}

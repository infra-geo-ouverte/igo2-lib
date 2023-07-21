import { NgModule } from '@angular/core';

import { IgoPanelModule, IgoEntityTableModule } from '@igo2/common';
import { IgoMapModule, IgoFeatureModule } from '@igo2/geo';

import { AppFeatureComponent } from './feature.component';
import { AppFeatureRoutingModule } from './feature-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppFeatureComponent],
  imports: [
    SharedModule,
    AppFeatureRoutingModule,
    IgoPanelModule,
    IgoEntityTableModule,
    IgoMapModule,
    IgoFeatureModule
  ],
  exports: [AppFeatureComponent]
})
export class AppFeatureModule {}

import { NgModule } from '@angular/core';

import { IgoEntitySelectorModule } from '@igo2/common';

import { AppEntitySelectorComponent } from './entity-selector.component';
import { AppEntitySelectorRoutingModule } from './entity-selector-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [AppEntitySelectorComponent],
  imports: [
    SharedModule,
    AppEntitySelectorRoutingModule,
    IgoEntitySelectorModule
  ],
  exports: [AppEntitySelectorComponent]
})
export class AppEntitySelectorModule {}

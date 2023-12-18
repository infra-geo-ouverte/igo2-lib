import { NgModule } from '@angular/core';

import { IgoEntitySelectorModule } from '@igo2/common';


import { AppEntitySelectorRoutingModule } from './entity-selector-routing.module';
import { AppEntitySelectorComponent } from './entity-selector.component';

@NgModule({
  imports: [
    AppEntitySelectorRoutingModule,
    IgoEntitySelectorModule,
    AppEntitySelectorComponent
],
  exports: [AppEntitySelectorComponent]
})
export class AppEntitySelectorModule {}

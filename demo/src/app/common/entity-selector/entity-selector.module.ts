import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { IgoEntitySelectorModule } from '@igo2/common';

import { AppEntitySelectorComponent } from './entity-selector.component';
import { AppEntitySelectorRoutingModule } from './entity-selector-routing.module';

@NgModule({
  declarations: [AppEntitySelectorComponent],
  imports: [
    CommonModule,
    AppEntitySelectorRoutingModule,
    MatCardModule,
    IgoEntitySelectorModule
  ],
  exports: [AppEntitySelectorComponent]
})
export class AppEntitySelectorModule {}

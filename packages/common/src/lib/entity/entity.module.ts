import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoEntitySelectorModule } from './entity-selector/entity-selector.module';
import { IgoEntityTableModule } from './entity-table/entity-table.module';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    IgoEntitySelectorModule,
    IgoEntityTableModule
  ],
  declarations: []
})
export class IgoEntityModule {}

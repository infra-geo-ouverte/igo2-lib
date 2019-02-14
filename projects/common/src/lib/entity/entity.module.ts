import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoEntityTableModule } from './entity-table/entity-table.module';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    IgoEntityTableModule
  ],
  declarations: []
})
export class IgoEntityModule {}

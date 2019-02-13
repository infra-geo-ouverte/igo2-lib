import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoLibEntityTableModule } from './entity-table/entity-table.module';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    IgoLibEntityTableModule
  ],
  declarations: []
})
export class IgoLibEntityModule {}

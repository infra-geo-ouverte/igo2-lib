import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatTableModule,
  MatSortModule,
  MatIconModule,
  MatCheckboxModule
} from '@angular/material';

import { EntityTableRowDirective } from './entity-table-row.directive';
import { EntityTableComponent } from './entity-table.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatCheckboxModule
  ],
  exports: [
    EntityTableComponent
  ],
  declarations: [
    EntityTableComponent,
    EntityTableRowDirective
  ]
})
export class IgoEntityTableModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatTableModule,
  MatSortModule,
  MatIconModule,
  MatCheckboxModule
} from '@angular/material';

import { IgoCustomHtmlModule } from '../../custom-html/custom-html.module';
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
    MatCheckboxModule,
    IgoCustomHtmlModule
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

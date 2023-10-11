import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoCustomHtmlModule } from '../../custom-html/custom-html.module';
import { IgoStopPropagationModule } from '../../stop-propagation/stop-propagation.module';
import { IgoEntityFieldsModule } from '../entity-fields/entity-fields.module';
import { IgoEntityTableCellsModule } from '../entity-table-cells';
import { IgoEntityTablePaginatorModule } from '../entity-table-paginator/entity-table-paginator.module';
import { EntityTableRowDirective } from './entity-table-row.directive';
import { EntityTableComponent } from './entity-table.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IgoCustomHtmlModule,
    IgoEntityFieldsModule,
    IgoEntityTablePaginatorModule,
    IgoEntityTableCellsModule,
    IgoStopPropagationModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
    ReactiveFormsModule
  ],
  exports: [EntityTableComponent],
  declarations: [EntityTableComponent, EntityTableRowDirective]
})
export class IgoEntityTableModule {}

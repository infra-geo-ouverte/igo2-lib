import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { IgoStopPropagationModule } from '../../stop-propagation/stop-propagation.module';
import { IgoCustomHtmlModule } from '../../custom-html/custom-html.module';
import { EntityTableRowDirective } from './entity-table-row.directive';
import { EntityTableComponent } from './entity-table.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { IgoEntityTablePaginatorModule } from '../entity-table-paginator/entity-table-paginator.module';
import { IgoImageModule } from '../../image/image.module';
import { IgoLanguageModule } from '@igo2/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { DateTimeInputModule } from '../../date-time-input/date-time-input.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSelectModule,
    IgoStopPropagationModule,
    IgoCustomHtmlModule,
    IgoEntityTablePaginatorModule,
    IgoImageModule,
    IgoLanguageModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatTooltipModule,
    DateTimeInputModule
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

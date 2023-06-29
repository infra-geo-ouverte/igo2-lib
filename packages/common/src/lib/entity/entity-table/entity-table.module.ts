import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';

import { IgoStopPropagationModule } from '../../stop-propagation/stop-propagation.module';
import { IgoCustomHtmlModule } from '../../custom-html/custom-html.module';
import { EntityTableRowDirective } from './entity-table-row.directive';
import { EntityTableComponent } from './entity-table.component';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { IgoEntityTablePaginatorModule } from '../entity-table-paginator/entity-table-paginator.module';
import { IgoImageModule } from '../../image/image.module';
import { IgoLanguageModule } from '@igo2/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatAutocompleteModule,
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
    MatTooltipModule
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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core';

import { IgoCustomHtmlModule } from '../../custom-html/custom-html.module';
import { IgoImageModule } from '../../image/image.module';
import { IgoStopPropagationModule } from '../../stop-propagation/stop-propagation.module';
import { IgoEntityTablePaginatorModule } from '../entity-table-paginator/entity-table-paginator.module';
import { EntityTableRowDirective } from './entity-table-row.directive';
import { EntityTableComponent } from './entity-table.component';

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
        MatTooltipModule,
        MatNativeDateModule,
        EntityTableComponent, EntityTableRowDirective
    ],
    exports: [EntityTableComponent]
})
export class IgoEntityTableModule {}

import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SimpleFeatureListComponent } from './simple-feature-list.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoStopPropagationModule } from '../../../stop-propagation/stop-propagation.module';
import { IgoCustomHtmlModule } from '../../../custom-html/custom-html.module';
import { IgoEntityTablePaginatorModule } from '../../entity-table-paginator/entity-table-paginator.module';
import { IgoImageModule } from '../../../image/image.module';
import { IgoLanguageModule } from '@igo2/core';
import { SimpleFeatureListPaginatorComponent } from './simple-feature-list-paginator.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatTooltipModule,
    MatPaginatorModule,
    IgoStopPropagationModule,
    IgoCustomHtmlModule,
    IgoEntityTablePaginatorModule,
    IgoImageModule,
    IgoLanguageModule
  ],
  exports: [
    SimpleFeatureListComponent
  ],
  declarations: [
    SimpleFeatureListComponent,
    SimpleFeatureListPaginatorComponent
  ]
})
export class IgoSimpleFeatureListModule {}

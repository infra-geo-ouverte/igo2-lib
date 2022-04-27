import { MatPaginatorModule } from '@angular/material/paginator';
import { SimpleFiltersComponent } from './simple-filters.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { IgoStopPropagationModule } from '../../../stop-propagation/stop-propagation.module';
import { IgoCustomHtmlModule } from '../../../custom-html/custom-html.module';
import { IgoImageModule } from '../../../image/image.module';
import { IgoLanguageModule } from '@igo2/core';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    MatPaginatorModule,
    IgoStopPropagationModule,
    IgoCustomHtmlModule,
    IgoImageModule,
    IgoLanguageModule
  ],
  exports: [
    SimpleFiltersComponent
  ],
  declarations: [
    SimpleFiltersComponent
  ]
})
export class IgoSimpleFiltersModule {}
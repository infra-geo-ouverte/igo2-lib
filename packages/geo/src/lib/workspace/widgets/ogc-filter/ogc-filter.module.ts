import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IgoLanguageModule } from '@igo2/core';

import { IgoFilterModule } from '../../../filter/filter.module';
import { OgcFilterComponent } from './ogc-filter.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    IgoLanguageModule,
    IgoFilterModule
  ],
  exports: [OgcFilterComponent],
  declarations: [OgcFilterComponent]
})
export class IgoOgcFilterModule {}

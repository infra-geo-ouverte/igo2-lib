import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material';

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
    IgoLanguageModule,
    IgoFilterModule
  ],
  exports: [OgcFilterComponent],
  declarations: [OgcFilterComponent],
  entryComponents: [OgcFilterComponent]
})
export class IgoOgcFilterModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

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
  declarations: [OgcFilterComponent]
})
export class IgoOgcFilterModule {}

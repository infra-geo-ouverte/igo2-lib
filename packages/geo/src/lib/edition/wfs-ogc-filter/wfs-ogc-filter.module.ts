import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';
import { IgoFilterModule } from '../../filter/filter.module';
import { WfsOgcFilterComponent } from './wfs-ogc-filter.component';

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
  exports: [WfsOgcFilterComponent],
  declarations: [WfsOgcFilterComponent],
  entryComponents: [WfsOgcFilterComponent]
})
export class IgoWfsOgcFilterModule {}

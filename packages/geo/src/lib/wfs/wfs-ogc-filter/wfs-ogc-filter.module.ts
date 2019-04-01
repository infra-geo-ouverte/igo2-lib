import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoFilterModule } from '../../filter/filter.module';

import { provideWfsOgcFilterWidget } from './wfs-ogc-filter.widget';
import { WfsOgcFilterComponent } from './wfs-ogc-filter.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoFilterModule
  ],
  exports: [WfsOgcFilterComponent],
  declarations: [WfsOgcFilterComponent],
  entryComponents: [WfsOgcFilterComponent],
  providers: [
    provideWfsOgcFilterWidget()
  ]
})
export class IgoWfsOgcFilterModule {}

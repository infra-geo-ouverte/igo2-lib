import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoWfsOgcFilterModule } from '../wfs-ogc-filter/wfs-ogc-filter.module';
import { WfsEditorSelectorDirective } from './wfs-editor-selector.directive';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoWfsOgcFilterModule
  ],
  exports: [
    WfsEditorSelectorDirective
  ],
  declarations: [
    WfsEditorSelectorDirective
  ]
})
export class IgoWfsEditorSelectorModule {}

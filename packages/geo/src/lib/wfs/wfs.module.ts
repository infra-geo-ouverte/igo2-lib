import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgoWidgetModule } from '@igo2/common';

import { IgoWfsEditorSelectorModule } from './wfs-editor-selector/wfs-editor-selector.module';
import { IgoWfsOgcFilterModule } from './wfs-ogc-filter/wfs-ogc-filter.module';

@NgModule({
  imports: [
    CommonModule,
    IgoWidgetModule,
    IgoWfsEditorSelectorModule,
    IgoWfsOgcFilterModule
  ],
  exports: [
    IgoWfsEditorSelectorModule,
    IgoWfsOgcFilterModule
  ],
  declarations: []
})
export class IgoWfsModule {}

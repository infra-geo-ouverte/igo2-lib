import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgoWidgetModule } from '@igo2/common';

import { provideWfsOgcFilterWidget } from './shared/wfs.widgets';
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
  declarations: [],
  providers: [
    provideWfsOgcFilterWidget()
  ]
})
export class IgoGeoEditionModule {}

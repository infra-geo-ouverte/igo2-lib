import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgoWidgetModule } from '@igo2/common';

import { provideOgcFilterWidget } from './shared/widgets';

import { IgoEditorSelectorModule } from './editor-selector/editor-selector.module';
import { IgoOgcFilterModule } from './ogc-filter/ogc-filter.module';

@NgModule({
  imports: [
    CommonModule,
    IgoWidgetModule,
    IgoEditorSelectorModule,
    IgoOgcFilterModule
  ],
  exports: [
    IgoEditorSelectorModule,
    IgoOgcFilterModule
  ],
  declarations: [],
  providers: [
    provideOgcFilterWidget()
  ]
})
export class IgoGeoEditionModule {}

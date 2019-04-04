import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoOgcFilterModule } from '../ogc-filter/ogc-filter.module';
import { EditorSelectorDirective } from './editor-selector.directive';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoOgcFilterModule
  ],
  exports: [
    EditorSelectorDirective
  ],
  declarations: [
    EditorSelectorDirective
  ]
})
export class IgoEditorSelectorModule {}

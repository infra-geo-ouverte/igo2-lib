import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoEntitySelectorModule } from '../../entity/entity-selector/entity-selector.module';

import { EditorSelectorComponent } from './editor-selector.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoEntitySelectorModule
  ],
  exports: [
    EditorSelectorComponent
  ],
  declarations: [
    EditorSelectorComponent
  ]
})
export class IgoEditorSelectorModule {}

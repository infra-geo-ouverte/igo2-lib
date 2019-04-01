import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoEditorOutletModule } from './editor-outlet/editor-outlet.module';
import { IgoEditorSelectorModule } from './editor-selector/editor-selector.module';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    IgoEditorOutletModule,
    IgoEditorSelectorModule
  ],
  declarations: []
})
export class IgoEditionModule {}

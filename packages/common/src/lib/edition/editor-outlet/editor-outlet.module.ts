import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IgoWidgetOutletModule } from '../../widget/widget-outlet/widget-outlet.module';

import { EditorOutletComponent } from './editor-outlet.component';

/**
 * @ignore
 */
@NgModule({
  imports: [
    CommonModule,
    IgoWidgetOutletModule
  ],
  exports: [
    EditorOutletComponent
  ],
  declarations: [
    EditorOutletComponent
  ]
})
export class IgoEditorOutletModule {}

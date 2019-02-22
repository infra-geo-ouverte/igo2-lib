import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoContextModule } from '@igo2/context';
import { ContextEditorToolComponent } from './context-editor-tool.component';

@NgModule({
  imports: [IgoContextModule],
  declarations: [ContextEditorToolComponent],
  exports: [ContextEditorToolComponent],
  entryComponents: [ContextEditorToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoContextEditorToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoContextEditorToolModule,
      providers: []
    };
  }
}

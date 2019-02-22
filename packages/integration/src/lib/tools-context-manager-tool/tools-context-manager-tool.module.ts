import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoContextModule } from '@igo2/context';
import { ToolsContextManagerToolComponent } from './tools-context-manager-tool.component';

@NgModule({
  imports: [IgoContextModule],
  declarations: [ToolsContextManagerToolComponent],
  exports: [ToolsContextManagerToolComponent],
  entryComponents: [ToolsContextManagerToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoToolsContextManagerToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoToolsContextManagerToolModule,
      providers: []
    };
  }
}

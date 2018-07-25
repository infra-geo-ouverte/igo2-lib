import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoContextModule } from '@igo2/context';
import { ContextManagerToolComponent } from './context-manager-tool.component';

@NgModule({
  imports: [IgoContextModule],
  declarations: [ContextManagerToolComponent],
  exports: [ContextManagerToolComponent],
  entryComponents: [ContextManagerToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoContextManagerToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoContextManagerToolModule,
      providers: []
    };
  }
}

import {
  NgModule,
  ModuleWithProviders,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';

import { IgoContextModule } from '@igo2/context';
import { PermissionsContextManagerToolComponent } from './permissions-context-manager-tool.component';

@NgModule({
  imports: [IgoContextModule],
  declarations: [PermissionsContextManagerToolComponent],
  exports: [PermissionsContextManagerToolComponent],
  entryComponents: [PermissionsContextManagerToolComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgoPermissionsContextManagerToolModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoPermissionsContextManagerToolModule,
      providers: []
    };
  }
}

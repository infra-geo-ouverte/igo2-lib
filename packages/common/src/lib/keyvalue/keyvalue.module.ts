import { ModuleWithProviders, NgModule } from '@angular/core';

import { KeyValuePipe } from './keyvalue.pipe';

@NgModule({
    imports: [KeyValuePipe],
    exports: [KeyValuePipe]
})
export class IgoKeyValueModule {
  static forRoot(): ModuleWithProviders<IgoKeyValueModule> {
    return {
      ngModule: IgoKeyValueModule,
      providers: []
    };
  }
}

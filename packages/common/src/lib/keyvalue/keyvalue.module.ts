import { ModuleWithProviders, NgModule } from '@angular/core';

import { KeyValuePipe } from './keyvalue.pipe';

@NgModule({
  imports: [],
  declarations: [KeyValuePipe],
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

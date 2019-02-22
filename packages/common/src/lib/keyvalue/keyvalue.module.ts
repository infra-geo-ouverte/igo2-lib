import { NgModule, ModuleWithProviders } from '@angular/core';
import { KeyValuePipe } from './keyvalue.pipe';

@NgModule({
  imports: [],
  declarations: [KeyValuePipe],
  exports: [KeyValuePipe]
})
export class IgoKeyValueModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoKeyValueModule,
      providers: []
    };
  }
}

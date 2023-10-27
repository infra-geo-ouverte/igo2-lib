import { ModuleWithProviders, NgModule } from '@angular/core';

import {
  provideStyleListLoader,
  provideStyleListOptions
} from './style-list.provider';

@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class IgoStyleListModule {
  static forRoot(): ModuleWithProviders<IgoStyleListModule> {
    return {
      ngModule: IgoStyleListModule,
      providers: [provideStyleListOptions({}), provideStyleListLoader()]
    };
  }
}

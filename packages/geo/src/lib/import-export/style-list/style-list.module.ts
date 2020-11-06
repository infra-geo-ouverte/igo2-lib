import { NgModule, ModuleWithProviders } from '@angular/core';
import { provideStyleListOptions, provideStyleListLoader } from './style-list.provider';

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

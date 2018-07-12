import { NgModule, ModuleWithProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ActivityInterceptor } from './activity.interceptor';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ActivityInterceptor,
      multi: true
    }
  ]
})
export class IgoActivityModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoActivityModule,
      providers: []
    };
  }
}

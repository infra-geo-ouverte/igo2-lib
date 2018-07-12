import { NgModule, ModuleWithProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { ErrorInterceptor } from './error.interceptor';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ]
})
export class IgoErrorModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoErrorModule,
      providers: []
    };
  }
}

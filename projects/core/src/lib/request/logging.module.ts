import { NgModule, ModuleWithProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { LoggingInterceptor } from './logging.interceptor';

@NgModule({
  imports: [],
  declarations: [],
  exports: [],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true
    }
  ]
})
export class IgoLoggingModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoLoggingModule,
      providers: []
    };
  }
}

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { LoggingInterceptor } from './logging.interceptor';

@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class IgoLoggingModule {
  static forRoot(): ModuleWithProviders<IgoLoggingModule> {
    return {
      ngModule: IgoLoggingModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: LoggingInterceptor,
          multi: true
        }
      ]
    };
  }
}

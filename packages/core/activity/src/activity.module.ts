import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { ActivityInterceptor } from './activity.interceptor';

@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class IgoActivityModule {
  static forRoot(): ModuleWithProviders<IgoActivityModule> {
    return {
      ngModule: IgoActivityModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ActivityInterceptor,
          multi: true
        }
      ]
    };
  }
}

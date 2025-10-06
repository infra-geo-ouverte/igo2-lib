import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule, inject } from '@angular/core';

import { ErrorInterceptor } from './error.interceptor';

@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class IgoErrorModule {
  static forRoot(): ModuleWithProviders<IgoErrorModule> {
    return {
      ngModule: IgoErrorModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        }
      ]
    };
  }

  constructor() {
    const parentModule = inject(IgoErrorModule, {
      optional: true,
      skipSelf: true
    });

    if (parentModule) {
      throw new Error(
        'IgoErrorModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}

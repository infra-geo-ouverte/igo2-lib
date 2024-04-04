import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { AuthFormComponent, AuthStorageService } from '@igo2/auth/form';
import { withMicrosoftSupport } from '@igo2/auth/microsoft';
import { IgoLanguageModule } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';

import { AuthInterceptor } from '../public_api';

/**
 * @deprecated import the AuthFormComponent directly and configure the auth with provideAuthentification
 */
@NgModule({
  imports: [CommonModule, IgoLanguageModule, AuthFormComponent],
  exports: [AuthFormComponent]
})
export class IgoAuthFormModule {
  static forRoot(): ModuleWithProviders<IgoAuthFormModule> {
    return {
      ngModule: IgoAuthFormModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        },
        {
          provide: StorageService,
          useClass: AuthStorageService
        },
        ...withMicrosoftSupport('add').providers,
        ...withMicrosoftSupport('b2c').providers
      ]
    };
  }
}

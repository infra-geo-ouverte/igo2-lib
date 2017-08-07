import { NgModule, ModuleWithProviders } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';

import { AuthHttp } from 'angular2-jwt';

import { ConfigService } from '../core';
import { IgoSharedModule } from '../shared';
import { AuthFormComponent,
         AuthInternComponent,
         AuthFacebookComponent,
         AuthGoogleComponent
} from './auth-form';

import { AuthService,
        AuthGuard,
        ProtectedDirective,
        authHttpServiceFactory } from './shared';

@NgModule({
    imports: [IgoSharedModule],
    declarations: [
      AuthFormComponent,
      AuthInternComponent,
      AuthFacebookComponent,
      AuthGoogleComponent,
      ProtectedDirective
    ],
    exports: [
      AuthFormComponent,
      ProtectedDirective
    ]
})


export class IgoAuthModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAuthModule,
      providers: [
        AuthService,
        AuthGuard,
        {
          provide: AuthHttp,
          useFactory: authHttpServiceFactory,
          deps: [Http, RequestOptions, ConfigService]
        }
      ]
    };
  }
}

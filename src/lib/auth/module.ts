import { NgModule, ModuleWithProviders } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';

import { AuthHttp, AuthConfig } from 'angular2-jwt';

import { IgoSharedModule } from '../shared';
import { AuthFormComponent,
         AuthInternComponent,
         AuthFacebookComponent,
         AuthGoogleComponent
} from './auth-form';

import { AuthService } from './shared';


export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig({
    headerName: 'Authorization',
    headerPrefix: '',
    tokenName: 'id_token_igo', // TODO : move in config
    tokenGetter: (() => localStorage.getItem('id_token_igo')),
    noJwtError: true
  }), http, options);
}

@NgModule({
    imports: [IgoSharedModule],
    declarations: [
      AuthFormComponent,
      AuthInternComponent,
      AuthFacebookComponent,
      AuthGoogleComponent
    ],
    exports: [AuthFormComponent]
})


export class IgoAuthModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAuthModule,
      providers: [
        AuthService,
        {
          provide: AuthHttp,
          useFactory: authHttpServiceFactory,
          deps: [Http, RequestOptions]
        }
      ]
    };
  }
}

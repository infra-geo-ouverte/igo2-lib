import { NgModule, ModuleWithProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { IgoSharedModule } from '../shared';
import { AuthFormComponent,
         AuthInternComponent,
         AuthFacebookComponent,
         AuthGoogleComponent
} from './auth-form';

import { TokenService,
        AuthService,
        AuthGuard,
        ProtectedDirective,
        AuthInterceptor,
        PoiService } from './shared';

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
        TokenService,
        PoiService,
        AuthGuard,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    };
  }
}

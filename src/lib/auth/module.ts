import { NgModule, ModuleWithProviders } from '@angular/core';

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
        provideAuthInterceptor,
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
        provideAuthInterceptor()
      ]
    };
  }
}

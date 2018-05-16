import { NgModule, ModuleWithProviders } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material';

import { IgoCoreModule } from '@igo/core';

import { ProtectedDirective, AuthInterceptor } from './shared';
import {
  AuthFormComponent,
  AuthGoogleComponent,
  AuthInternComponent,
  AuthFacebookComponent
} from './auth-form';

@NgModule({
  imports: [ReactiveFormsModule, MatFormFieldModule, IgoCoreModule],
  declarations: [
    AuthFormComponent,
    AuthGoogleComponent,
    AuthInternComponent,
    AuthFacebookComponent,
    ProtectedDirective
  ],
  exports: [AuthFormComponent, ProtectedDirective]
})
export class IgoAuthModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IgoAuthModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    };
  }
}

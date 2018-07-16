import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material';

import { IgoLanguageModule } from '@igo2/core';

import { ProtectedDirective } from './shared/protected.directive';
import { AuthInterceptor } from './shared/auth.interceptor';

import { AuthInternComponent } from './auth-form/auth-intern.component';
import { AuthFormComponent } from './auth-form/auth-form.component';
import { AuthGoogleComponent } from './auth-form/auth-google.component';
import { AuthFacebookComponent } from './auth-form/auth-facebook.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    IgoLanguageModule
  ],
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

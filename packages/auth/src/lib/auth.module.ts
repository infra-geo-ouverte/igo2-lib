import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { IgoLanguageModule, StorageService } from '@igo2/core';

import { MsalModule } from '@azure/msal-angular';

import { AuthFacebookComponent } from './auth-form/auth-facebook.component';
import { AuthFormComponent } from './auth-form/auth-form.component';
import { AuthGoogleComponent } from './auth-form/auth-google.component';
import { AuthInternComponent } from './auth-form/auth-intern.component';
import { AuthMicrosoftComponent } from './auth-form/auth-microsoft.component';
import { AuthMicrosoftb2cComponent } from './auth-form/auth-microsoftb2c.component';
import { provideAuthMicrosoft } from './shared/auth-microsoft.provider';
import { AuthStorageService } from './shared/auth-storage.service';
import { AuthInterceptor } from './shared/auth.interceptor';
import { ProtectedDirective } from './shared/protected.directive';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    IgoLanguageModule,
    MsalModule,
    AuthFormComponent,
    AuthGoogleComponent,
    AuthInternComponent,
    AuthFacebookComponent,
    AuthMicrosoftComponent,
    AuthMicrosoftb2cComponent,
    ProtectedDirective
  ],
  exports: [AuthFormComponent, ProtectedDirective]
})
export class IgoAuthModule {
  static forRoot(): ModuleWithProviders<IgoAuthModule> {
    return {
      ngModule: IgoAuthModule,
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
        ...provideAuthMicrosoft('add'),
        ...provideAuthMicrosoft('b2c')
      ]
    };
  }
}

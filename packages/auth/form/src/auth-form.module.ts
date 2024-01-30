import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthInterceptor } from '@igo2/auth';
import { AuthFacebookComponent } from '@igo2/auth/facebook';
import { AuthGoogleComponent } from '@igo2/auth/google';
import { AuthInternComponent } from '@igo2/auth/internal';
import {
  AuthMicrosoftComponent,
  AuthMicrosoftb2cComponent,
  provideAuthMicrosoft
} from '@igo2/auth/microsoft';
import { IgoLanguageModule } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';

import { MsalModule } from '@azure/msal-angular';

import { AuthFormComponent } from './auth-form/auth-form.component';
import { AuthStorageService } from './shared/auth-storage.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    IgoLanguageModule,
    MsalModule,
    AuthFormComponent,
    AuthGoogleComponent,
    AuthInternComponent,
    AuthFacebookComponent,
    AuthMicrosoftComponent,
    AuthMicrosoftb2cComponent
  ],
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
        ...provideAuthMicrosoft('add'),
        ...provideAuthMicrosoft('b2c')
      ]
    };
  }
}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthFacebookComponent } from '@igo2/auth/facebook';
import { AuthGoogleComponent } from '@igo2/auth/google';
import { AuthInternComponent } from '@igo2/auth/internal';
import {
  AuthMicrosoftComponent,
  AuthMicrosoftb2cComponent
} from '@igo2/auth/microsoft';
import { IgoLanguageModule } from '@igo2/core/language';

import { MsalModule } from '@azure/msal-angular';

import { AuthFormComponent } from './auth-form/auth-form.component';

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
export class IgoAuthFormModule {}

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { AuthService, TokenService, User } from '@igo2/auth';
import { IgoLanguageModule } from '@igo2/core/language';
import { StorageService } from '@igo2/core/storage';

@Component({
  selector: 'igo-user-dialog',
  templateUrl: './user-dialog.component.html',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatButtonModule,
    MatDialogActions,
    IgoLanguageModule
  ]
})
export class UserDialogComponent {
  dialogRef = inject<MatDialogRef<UserDialogComponent>>(MatDialogRef);
  private auth = inject(AuthService);
  private tokenService = inject(TokenService);
  private storageService = inject(StorageService);

  public user?: User | null;
  public exp?: string;

  constructor() {
    this.user = this.auth?.user;
    this.exp = this.expirationTime;
  }

  get expirationTime(): string | undefined {
    const decodeToken = this.tokenService.decode();
    return decodeToken?.exp
      ? new Date(decodeToken.exp * 1000).toLocaleString()
      : undefined;
  }

  clearPreferences() {
    this.storageService.clear();
  }
}

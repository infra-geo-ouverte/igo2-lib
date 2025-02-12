import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';

import { AuthService } from '@igo2/auth';
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
  public user;
  public exp;

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    private auth: AuthService,
    private storageService: StorageService
  ) {
    const decodeToken = this.auth.decodeToken();
    this.user = decodeToken?.user;
    this.exp = new Date(decodeToken.exp * 1000).toLocaleString();
  }

  clearPreferences() {
    this.storageService.clear();
  }
}

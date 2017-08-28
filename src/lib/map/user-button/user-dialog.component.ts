import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';

import { AuthService } from '../../auth';

@Component({
  selector: 'igo-user-dialog',
  templateUrl: './user-dialog.component.html',
})
export class UserDialogComponent {

  public user;
  public exp;

  constructor(
    public dialogRef: MdDialogRef<UserDialogComponent>,
    private auth: AuthService
  ) {
    this.user = this.auth.decodeToken().user;
    this.exp = new Date(this.user.exp*1000).toLocaleString();
  }
}

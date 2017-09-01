import { Component, Input } from '@angular/core';
import { MdDialog } from '@angular/material';

import { AuthService } from '../../auth';
import { IgoMap } from '../shared';
import { UserDialogComponent } from './user-dialog.component';
import { userButtonSlideInOut } from './user-button.animation';

@Component({
  selector: 'igo-user-button',
  templateUrl: './user-button.component.html',
  styleUrls: ['./user-button.component.styl'],
  animations: [
    userButtonSlideInOut()
  ]
})
export class UserButtonComponent {

  @Input()
  get map(): IgoMap { return this._map; }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get color(): string { return this._color; }
  set color(value: string) {
    this._color = value;
  }
  private _color: string;

  public expand: boolean = false;

  constructor(
    private dialog: MdDialog,
    public auth: AuthService
  ) {}

  accountClick() {
    if (this.auth.authenticated) {
      this.expand = !this.expand;
    } else {
      this.auth.logout();
    }
  }

  logout() {
    this.expand = false;
    this.auth.logout();
  }

  infoUser() {
    this.dialog.open(UserDialogComponent, {disableClose: false});
  }

}

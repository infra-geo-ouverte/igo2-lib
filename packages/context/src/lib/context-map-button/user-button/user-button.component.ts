import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ConfigService } from '@igo2/core';
import { AuthService } from '@igo2/auth';
import { IgoMap } from '@igo2/geo';

import { UserDialogComponent } from './user-dialog.component';
import { userButtonSlideInOut } from './user-button.animation';

@Component({
  selector: 'igo-user-button',
  templateUrl: './user-button.component.html',
  styleUrls: ['./user-button.component.scss'],
  animations: [userButtonSlideInOut()]
})
export class UserButtonComponent {
  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get color(): string {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color: string;

  public expand = false;
  public visible = false;
  public hasApi = false;

  constructor(
    private dialog: MatDialog,
    private config: ConfigService,
    public auth: AuthService
  ) {
    this.visible = this.config.getConfig('auth') ? true : false;
    this.hasApi = this.config.getConfig('context.url') !== undefined;
  }

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
    this.dialog.open(UserDialogComponent, { disableClose: false });
  }
}

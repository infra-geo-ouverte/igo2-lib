import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '@igo2/auth';
import { ConfigService } from '@igo2/core';
import type { IgoMap } from '@igo2/geo';

import { userButtonSlideInOut } from './user-button.animation';
import { UserDialogComponent } from './user-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { PoiButtonComponent } from '../poi-button/poi-button.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'igo-user-button',
    templateUrl: './user-button.component.html',
    styleUrls: ['./user-button.component.scss'],
    animations: [userButtonSlideInOut()],
    standalone: true,
    imports: [NgIf, PoiButtonComponent, MatButtonModule, MatTooltipModule, MatIconModule, TranslateModule]
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

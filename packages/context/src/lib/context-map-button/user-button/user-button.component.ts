import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '@igo2/auth';
import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';
import type { IgoMap } from '@igo2/geo';

import { PoiButtonComponent } from '../poi-button/poi-button.component';
import { userButtonSlideInOut } from './user-button.animation';
import { UserDialogComponent } from './user-dialog.component';

@Component({
  selector: 'igo-user-button',
  templateUrl: './user-button.component.html',
  styleUrls: ['./user-button.component.scss'],
  animations: [userButtonSlideInOut()],
  imports: [
    PoiButtonComponent,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class UserButtonComponent {
  private dialog = inject(MatDialog);
  private config = inject(ConfigService);
  auth = inject(AuthService);

  readonly map = input.required<IgoMap>();
  readonly color = input<string>();

  public expand = false;
  public visible = false;
  public hasApi = false;

  constructor() {
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

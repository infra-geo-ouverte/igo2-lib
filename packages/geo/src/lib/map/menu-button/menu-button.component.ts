import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfigService } from '@igo2/core/config';

import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'igo-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    NgClass,
    MatTooltipModule,
    MatIconModule,
    TranslateModule
  ]
})
export class MenuButtonComponent {
  @Input()
  get sidenavOpened(): boolean {
    return this._sidenavOpenend;
  }
  set sidenavOpened(value: boolean) {
    this._sidenavOpenend = value;
    this.getClassMenuButton();
  }
  private _sidenavOpenend: boolean;

  @Output() openSidenav = new EventEmitter<any>();

  public useThemeColor: boolean;

  public menuButtonClass;

  constructor(public configService: ConfigService) {
    const configValue = this.configService.getConfig(
      'menu.button.useThemeColor'
    );
    this.useThemeColor = configValue !== undefined ? configValue : false;
  }

  getClassMenuButton() {
    this.menuButtonClass = {
      'menu-button-white-background': !this.useThemeColor
    };
  }

  onToggleSidenavClick() {
    this.openSidenav.emit();
  }
}

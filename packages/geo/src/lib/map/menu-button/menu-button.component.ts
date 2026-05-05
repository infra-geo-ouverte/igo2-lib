import { NgClass } from '@angular/common';
import { Component, Input, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ConfigService } from '@igo2/core/config';
import { IgoLanguageModule } from '@igo2/core/language';

@Component({
  selector: 'igo-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.scss'],
  imports: [
    MatButtonModule,
    NgClass,
    MatTooltipModule,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class MenuButtonComponent {
  configService = inject(ConfigService);

  @Input()
  get sidenavOpened(): boolean {
    return this._sidenavOpenend;
  }
  set sidenavOpened(value: boolean) {
    this._sidenavOpenend = value;
    this.getClassMenuButton();
  }
  private _sidenavOpenend: boolean;

  readonly openSidenav = output();

  public useThemeColor: boolean;

  public menuButtonClass;

  constructor() {
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
    // TODO: The 'emit' function requires a mandatory any argument
    this.openSidenav.emit();
  }
}

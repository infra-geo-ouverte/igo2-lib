import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ConfigService } from '@igo2/core';

@Component({
  selector: 'igo-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.scss']
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

  public menuButtonReverseColor = false;

  public menuButtonClass;

  constructor(public configService: ConfigService) {
    const configValue = this.configService.getConfig('menuButtonReverseColor');
    if (configValue !== undefined) {
      this.menuButtonReverseColor = configValue;
    }
  }

  getClassMenuButton() {
    this.menuButtonClass = {
      'menu-button-white-background': !this.menuButtonReverseColor
    };
  }

  onToggleSidenavClick() {
    this.openSidenav.emit();
  }
}

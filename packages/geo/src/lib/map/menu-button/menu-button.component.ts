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
    if (
      typeof this.configService.getConfig('menuButtonReverseColor') !==
      'undefined'
    ) {
      this.menuButtonReverseColor = this.configService.getConfig(
        'menuButtonReverseColor'
      );
    }
  }

  getClassMenuButton() {
    if (this.sidenavOpened) {
      this.menuButtonClass = {
        'menu-button': this.menuButtonReverseColor === false,
        'menu-button-reverse-color': this.menuButtonReverseColor === true
      };
    } else {
      this.menuButtonClass = {
        'menu-button': this.menuButtonReverseColor === false,
        'menu-button-reverse-color-close': this.menuButtonReverseColor === true
      };
    }
  }

  onToggleSidenavClick() {
    this.openSidenav.emit();
  }
}

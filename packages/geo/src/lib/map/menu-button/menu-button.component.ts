import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ConfigService } from '@igo2/core';
import { BehaviorSubject } from 'rxjs';

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
    this.sidenavOpened$.next(value);
    this.getClassMenuButton();
  }
  private _sidenavOpenend: boolean;

  @Output() openSidenav = new EventEmitter<any>();

  public menuButtonReverseColor: boolean;

  public menuButtonClass$: BehaviorSubject<{ [key: string]: any }> = new BehaviorSubject(undefined);
  public sidenavOpened$: BehaviorSubject<boolean> = new BehaviorSubject(undefined);

  constructor(public configService: ConfigService) { }

  getClassMenuButton() {
    if (this.menuButtonReverseColor === undefined) {
      this.menuButtonReverseColor = this.configService.getConfig('menuButtonReverseColor') || false;
    }
    let menuButtonClass: { [key: string]: any };
    if (this.sidenavOpened) {
      menuButtonClass = {
        'menu-button': this.menuButtonReverseColor === false,
        'menu-button-reverse-color': this.menuButtonReverseColor === true
      };
    } else {
      menuButtonClass = {
        'menu-button': this.menuButtonReverseColor === false,
        'menu-button-reverse-color-close': this.menuButtonReverseColor === true
      };
    }
    this.menuButtonClass$.next(menuButtonClass);
  }

  onToggleSidenavClick() {
    this.openSidenav.emit();
  }
}

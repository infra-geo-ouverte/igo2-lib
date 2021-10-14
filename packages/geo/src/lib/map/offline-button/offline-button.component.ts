import { Component, Input, EventEmitter, Output } from '@angular/core';
import { IgoMap } from '../shared/map';
import { ConfigService } from '@igo2/core';

@Component({
  selector: 'igo-offline-button',
  templateUrl: './offline-button.component.html',
  styleUrls: ['./offline-button.component.scss']
})

export class OfflineButtonComponent {

  btnStyle: string = 'baseStyle';
  colorOff: string = 'rgb(255,255,255)';

  @Output() change = new EventEmitter<boolean>();

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

  @Input() public check: boolean = false;

  get checked(): boolean {
    return this.check;
  }

  public visible = false;

  constructor(
    private config: ConfigService
    ) {
    this.visible = this.config.getConfig('offlineButton') ? true : false;
  }

  onToggle() {
    this.check = !this.check;
    if (this.check) {
      this.btnStyle = 'toggleStyle';
    } else {
      this.btnStyle = 'baseStyle';
    }
  }
}

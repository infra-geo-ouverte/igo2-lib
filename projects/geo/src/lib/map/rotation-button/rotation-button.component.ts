import { Component, Input } from '@angular/core';

import { IgoMap } from '../shared/map';

@Component({
  selector: 'igo-rotation-button',
  templateUrl: './rotation-button.component.html',
  styleUrls: ['./rotation-button.component.scss']
})
export class RotationButtonComponent {
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

  constructor() {}

  rotationStyle(radians): {} {
    let degree = Math.round(radians * 180 / Math.PI);
    if (degree < 0) {
      degree = 360 - degree;
    }
    const rotation = 'rotate(' + degree + 'deg)';

    return {
      '-webkit-transform': rotation,
      '-moz-transform': rotation,
      '-ms-transform': rotation,
      '-o-transform': rotation,
      'transform': rotation
    };
  }
}

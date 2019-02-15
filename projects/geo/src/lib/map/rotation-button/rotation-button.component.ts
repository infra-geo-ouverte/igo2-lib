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
    const rotation = 'rotate(' + radians + 'rad)';
    return {
      'transform': rotation
    };
  }
}

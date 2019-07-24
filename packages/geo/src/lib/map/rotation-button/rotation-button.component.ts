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
  get showIfNoRotation(): boolean {
    return this._showIfNoRotation;
  }
  set showIfNoRotation(value: boolean) {
    this._showIfNoRotation = value;
  }
  private _showIfNoRotation: boolean;

  @Input()
  get color(): string {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color: string;

  get rotated(): boolean {
    return this.map.viewController.getRotation() !== 0;
  }

  constructor() {}

  rotationStyle(radians): {} {
    const rotation = 'rotate(' + radians + 'rad)';
    return {
      transform: rotation
    };
  }
}

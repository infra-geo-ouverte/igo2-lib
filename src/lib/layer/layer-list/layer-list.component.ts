import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Register } from '../../tool';

import { Layer } from '../shared';


@Register({
  name: 'layerList',
  title: 'igo.map',
  icon: 'map'
})
@Component({
  selector: 'igo-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerListComponent {

  @Input()
  get layers(): Layer[] { return this._layers; }
  set layers(value: Layer[]) {
    this._layers = value;
  }
  private _layers: Layer[] = [];

  @Input()
  get color() { return this._color; }
  set color(value: string) {
    this._color = value;
  }
  private _color: string = 'primary';

  constructor() { }

}

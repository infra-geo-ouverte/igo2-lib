import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Layer } from '../shared/layers';

@Component({
  selector: 'igo-layer-legend',
  templateUrl: './layer-legend.component.html',
  styleUrls: ['./layer-legend.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerLegendComponent {

  @Input()
  get layer(): Layer { return this._layer; }
  set layer(value: Layer) {
    this._layer = value;
    this._legend = value.dataSource.getLegend();
  }
  private _layer: Layer;

  get legend() { return this._legend; }
  private _legend;

  constructor() {}

}

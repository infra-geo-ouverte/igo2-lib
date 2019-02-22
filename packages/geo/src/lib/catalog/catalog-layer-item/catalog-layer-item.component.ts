import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { LayerOptions } from '../../layer';

@Component({
  selector: 'igo-catalog-layer-item',
  templateUrl: './catalog-layer-item.component.html',
  styleUrls: ['./catalog-layer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLayerItemComponent {
  @Input()
  get layer(): LayerOptions {
    return this._layer;
  }
  set layer(value: LayerOptions) {
    this._layer = value;
  }
  private _layer: LayerOptions;

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  constructor() {}
}

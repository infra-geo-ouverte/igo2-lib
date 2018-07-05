import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { LayerCatalog } from '../../layer';

@Component({
  selector: 'igo-catalog-layer-item',
  templateUrl: './catalog-layer-item.component.html',
  styleUrls: ['./catalog-layer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLayerItemComponent {
  @Input()
  get layer(): LayerCatalog {
    return this._layer;
  }
  set layer(value: LayerCatalog) {
    this._layer = value;
  }
  private _layer: LayerCatalog;

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color: string = 'primary';

  constructor() {}
}

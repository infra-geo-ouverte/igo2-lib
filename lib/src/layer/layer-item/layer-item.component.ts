import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Layer } from '../shared/layers/layer';

@Component({
  selector: 'igo-layer-item',
  templateUrl: './layer-item.component.html',
  styleUrls: ['./layer-item.component.styl'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerItemComponent {

  @Input()
  get layer(): Layer { return this._layer; }
  set layer(value: Layer) {
    this._layer = value;
  }
  private _layer: Layer;

  @Input()
  get edition() { return this._edition; }
  set edition(value: boolean) {
    this._edition = value;
  }
  private _edition: boolean = false;

  @Input()
  get color() { return this._color; }
  set color(value: string) {
    this._color = value;
  }
  private _color: string = 'primary';

  get opacity () {
    return this.layer.opacity * 100;
  }

  set opacity (opacity: number) {
    this.layer.opacity = opacity / 100;
  }

  constructor() { }

  toggleLegend(collapsed: boolean) {
    this.layer.collapsed = collapsed;
  }

  toggleVisibility() {
    this.layer.visible = !this.layer.visible;
    this.toggleLegend(!this.layer.visible);
  }

}

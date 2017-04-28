import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Layer } from '../shared';


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

  @Input()
  get toggleLegendOnVisibilityChange() {
    return this._toggleLegendOnVisibilityChange;
  }
  set toggleLegendOnVisibilityChange(value: boolean) {
    this._toggleLegendOnVisibilityChange = value;
  }
  private _toggleLegendOnVisibilityChange: boolean = false;

  constructor() { }

}

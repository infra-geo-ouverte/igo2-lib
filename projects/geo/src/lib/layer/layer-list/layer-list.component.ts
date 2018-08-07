import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  TemplateRef,
  ContentChild
} from '@angular/core';

import { Layer } from '../shared';

@Component({
  selector: 'igo-layer-list',
  templateUrl: './layer-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerListComponent {
  @ContentChild('igoLayerItemToolbar') templateLayerToolbar: TemplateRef<any>;

  @Input()
  get layers(): Layer[] {
    return this._layers;
  }
  set layers(value: Layer[]) {
    this._layers = value;
    this.cdRef.detectChanges();
  }
  private _layers: Layer[] = [];

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  @Input()
  get excludeBaseLayers() {
    return this._excludeBaseLayers;
  }
  set excludeBaseLayers(value: boolean) {
    this._excludeBaseLayers = value;
  }
  private _excludeBaseLayers = false;

  @Input()
  get toggleLegendOnVisibilityChange() {
    return this._toggleLegendOnVisibilityChange;
  }
  set toggleLegendOnVisibilityChange(value: boolean) {
    this._toggleLegendOnVisibilityChange = value;
  }
  private _toggleLegendOnVisibilityChange = false;

  constructor(private cdRef: ChangeDetectorRef) {}
}

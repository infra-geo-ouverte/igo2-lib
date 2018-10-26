import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map';
import { OgcFilterableDataSourceOptions } from '../shared/ogc-filter.interface';

@Component({
  selector: 'igo-ogc-filter-button',
  templateUrl: './ogc-filter-button.component.html',
  styleUrls: ['./ogc-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OgcFilterButtonComponent {
  @Input()
  get layer(): Layer {
    return this._layer;
  }
  set layer(value: Layer) {
    this._layer = value;
  }
  private _layer: Layer;

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  public ogcFilterCollapse = false;

  @Input()
  get ogcFiltersInLayers(): boolean {
    return this._ogcFiltersInLayers;
  }
  set ogcFiltersInLayers(value: boolean) {
    this._ogcFiltersInLayers = value;
  }
  private _ogcFiltersInLayers = false;

  constructor() {}

  toggleOgcFilter() {
    if (this.layer.isInResolutionsRange) {
      this.ogcFilterCollapse = !this.ogcFilterCollapse;
    }
  }

  get options(): OgcFilterableDataSourceOptions {
    if (!this.layer) {
      return;
    }
    return this.layer.dataSource.options;
  }
}

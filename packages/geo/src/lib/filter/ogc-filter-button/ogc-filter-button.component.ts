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

  set layer(value: Layer) {
    this._layer = value;
  }

  @Input()
  get layer(): Layer {
    return this._layer;
  }

  set map(value: IgoMap) {
    this._map = value;
  }

  @Input()
  get map(): IgoMap {
    return this._map;
  }

  set color(value: string) {
    this._color = value;
  }

  @Input()
  get color() {
    return this._color;
  }

  set ogcFiltersInLayers(value: boolean) {
    this._ogcFiltersInLayers = value;
  }

  @Input()
  get ogcFiltersInLayers(): boolean {
    return this._ogcFiltersInLayers;
  }

  get options(): OgcFilterableDataSourceOptions {
    if (!this.layer) {
      return;
    }
    return this.layer.dataSource.options;
  }

  private _ogcFiltersInLayers = false;
  private _layer: Layer;
  private _map: IgoMap;
  private _color = 'primary';

  public ogcFilterCollapse = false;

  constructor() {}

  toggleOgcFilter() {
    if (this.layer.isInResolutionsRange) {
      this.ogcFilterCollapse = !this.ogcFilterCollapse;
    }
  }
}

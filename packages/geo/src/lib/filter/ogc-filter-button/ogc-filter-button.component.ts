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

  @Input() layer: Layer;

  @Input() map: IgoMap;

  @Input() color: string = 'primary';

  @Input() ogcFiltersInLayers: boolean;

  get options(): OgcFilterableDataSourceOptions {
    if (!this.layer) {
      return;
    }
    return this.layer.dataSource.options;
  }

  public ogcFilterCollapse = false;

  constructor() {}

  toggleOgcFilter() {
      this.ogcFilterCollapse = !this.ogcFilterCollapse;
  }
}

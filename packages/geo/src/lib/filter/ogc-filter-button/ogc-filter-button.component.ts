import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map';
import { OgcFilterableDataSourceOptions } from '../shared/ogc-filter.interface';

@Component({
  selector: 'igo-ogc-filter-button',
  templateUrl: './ogc-filter-button.component.html',
  styleUrls: ['./ogc-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OgcFilterButtonComponent implements OnInit {

  public options: OgcFilterableDataSourceOptions;

  @Input() layer: Layer;

  @Input() map: IgoMap;

  @Input() color: string = 'primary';

  @Input() header: boolean;

  public ogcFilterCollapse = false;

  constructor() {}

  ngOnInit() {
    this.options = this.layer.dataSource.options as OgcFilterableDataSourceOptions;
  }

  toggleOgcFilter() {
      this.ogcFilterCollapse = !this.ogcFilterCollapse;
  }
}

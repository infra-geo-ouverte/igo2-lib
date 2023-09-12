import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map/shared';
import { WMSDataSourceOptions } from '../../datasource/shared/datasources/wms-datasource.interface';
import { TimeFilterableDataSourceOptions } from '../../datasource';

@Component({
  selector: 'igo-time-filter-button',
  templateUrl: './time-filter-button.component.html',
  styleUrls: ['./time-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeFilterButtonComponent implements OnInit {

  public options: TimeFilterableDataSourceOptions;

  get badge() {
    const filter = this.options.timeFilter as any;
    if (filter && filter.enabled) {
      return 1;
    } else {
      return;
    }
  }

  @Input()
  get layer(): Layer {
    return this._layer;
  }
  set layer(value: Layer) {
    this._layer = value;
    if (value) {
      this.options = this.layer.dataSource.options as WMSDataSourceOptions;
    }
  }
  private _layer;

  @Input() map: IgoMap;

  @Input() color: string = 'primary';

  @Input() header: boolean = true;

  public timeFilterCollapse = false;

  constructor() {}

  ngOnInit() {
    this.options = this.layer.dataSource.options as WMSDataSourceOptions;
  }
}

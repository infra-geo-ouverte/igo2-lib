import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { IgoMap } from '../../map';
import { TimeFilterableDataSourceOptions } from '../shared/time-filter.interface';
import { WMSDataSourceOptions } from '../../datasource/shared/datasources/wms-datasource.interface';

@Component({
  selector: 'igo-time-filter-button',
  templateUrl: './time-filter-button.component.html',
  styleUrls: ['./time-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeFilterButtonComponent implements OnInit {

  public options: TimeFilterableDataSourceOptions;

  @Input() layer: Layer;

  @Input() map: IgoMap;

  @Input() color: string = 'primary';

  @Input() header: boolean = true;

  public timeFilterCollapse = false;

  constructor() {}

  ngOnInit() {
    this.options = this.layer.dataSource.options as WMSDataSourceOptions;
  }

  toggleTimeFilter() {
      this.timeFilterCollapse = !this.timeFilterCollapse;
  }
}

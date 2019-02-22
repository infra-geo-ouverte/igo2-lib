import { Component, Input } from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { TimeFilterableDataSource } from '../shared/time-filter.interface';
import { TimeFilterService } from '../shared/time-filter.service';

@Component({
  selector: 'igo-time-filter-item',
  templateUrl: './time-filter-item.component.html',
  styleUrls: ['./time-filter-item.component.scss']
})
export class TimeFilterItemComponent {
  @Input()
  get layer(): Layer {
    return this._layer;
  }
  set layer(value: Layer) {
    this._layer = value;
  }
  private _layer: Layer;

  get datasource(): TimeFilterableDataSource {
    return this.layer.dataSource as TimeFilterableDataSource;
  }
  constructor(private timeFilterService: TimeFilterService) {}

  handleYearChange(year: string | [string, string]) {
    this.timeFilterService.filterByYear(this.datasource, year);
  }

  handleDateChange(date: Date | [Date, Date]) {
    this.timeFilterService.filterByDate(this.datasource, date);
  }
}

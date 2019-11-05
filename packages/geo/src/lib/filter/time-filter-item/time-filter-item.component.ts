import { Component, Input } from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { TimeFilterableDataSource } from '../shared/time-filter.interface';
import { TimeFilterService } from '../shared/time-filter.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-time-filter-item',
  templateUrl: './time-filter-item.component.html',
  styleUrls: ['./time-filter-item.component.scss']
})
export class TimeFilterItemComponent {

  showLegend$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  filtersCollapsed: boolean = false;

  @Input() header: boolean = true;

  @Input() layer: Layer;

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

  private toggleLegend(collapsed: boolean) {
    this.layer.legendCollapsed = collapsed;
    this.showLegend$.next(!collapsed);
  }

  toggleLegendOnClick() {
    if (!this.filtersCollapsed) {
      this.toggleLegend(this.showLegend$.value);
    }
  }

  public setVisible() {
    this.layer.visible = true;
  }

  toggleFiltersCollapsed() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }
}

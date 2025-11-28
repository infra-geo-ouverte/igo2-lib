import { AsyncPipe, NgClass, NgStyle } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CollapseDirective } from '@igo2/common/collapsible';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, Subscription } from 'rxjs';

import { TimeFilterableDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { Layer } from '../../layer';
import { LayerLegendComponent } from '../../layer/layer-legend/layer-legend.component';
import { TimeFilterService } from '../shared/time-filter.service';
import { TimeFilterFormComponent } from '../time-filter-form/time-filter-form.component';

@Component({
  selector: 'igo-time-filter-item',
  templateUrl: './time-filter-item.component.html',
  styleUrls: ['./time-filter-item.component.scss'],
  imports: [
    MatListModule,
    MatIconModule,
    CollapseDirective,
    NgStyle,
    MatButtonModule,
    MatTooltipModule,
    NgClass,
    LayerLegendComponent,
    TimeFilterFormComponent,
    AsyncPipe,
    IgoLanguageModule
  ],
  providers: [TimeFilterService]
})
export class TimeFilterItemComponent implements OnInit, OnDestroy {
  private timeFilterService = inject(TimeFilterService);

  public color = 'primary';
  showLegend$ = new BehaviorSubject<boolean>(false);
  inResolutionRange$ = new BehaviorSubject<boolean>(true);
  private resolution$$: Subscription;

  filtersCollapsed = false;

  @Input() header = true;

  @Input() layer: Layer;

  get datasource(): TimeFilterableDataSource {
    return this.layer.dataSource as TimeFilterableDataSource;
  }

  ngOnInit(): void {
    const resolution$ = this.layer.map.viewController.resolution$;
    this.resolution$$ = resolution$.subscribe(() => {
      this.inResolutionRange$.next(this.layer.isInResolutionsRange);
    });
  }

  ngOnDestroy(): void {
    this.resolution$$.unsubscribe();
  }

  handleYearChange(year: string | [string, string]) {
    this.timeFilterService.filterByYear(this.datasource, year);
    this.datasource.options.timeFilter.value = year.toString();
  }

  handleDateChange(date: Date | [Date, Date]) {
    this.timeFilterService.filterByDate(this.datasource, date);
    this.datasource.options.timeFilter.value =
      date instanceof Date
        ? this.reformDate(date)
        : [this.reformDate(date[0]), this.reformDate(date[1])];
  }

  private reformDate(date: Date): string {
    return date.toISOString().split('.')[0] + 'Z';
  }

  toggleLegendOnClick() {
    if (!this.filtersCollapsed) {
      this.showLegend$.next(!this.showLegend$.value);
    }
  }

  public setVisible() {
    this.layer.visible = true;
  }

  toggleFiltersCollapsed() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }
}

import { AsyncPipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
  standalone: true,
  imports: [
    NgIf,
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
  constructor(private timeFilterService: TimeFilterService) {}

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

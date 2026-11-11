import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ListItemDirective } from '@igo2/common/list';
import { IgoLanguageModule } from '@igo2/core/language';

import { TimeFilterableDataSourceOptions } from '../../datasource/shared/datasources/wms-datasource.interface';
import { Layer } from '../../layer';
import { TimeFilterItemComponent } from '../time-filter-item';

@Component({
  selector: 'igo-time-filter-button',
  templateUrl: './time-filter-button.component.html',
  styleUrls: ['./time-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatBadgeModule,
    TimeFilterItemComponent,
    ListItemDirective,
    IgoLanguageModule
  ]
})
export class TimeFilterButtonComponent {
  readonly layer = input.required<Layer>();
  readonly options = computed<TimeFilterableDataSourceOptions>(
    () => this.layer()?.dataSource.options as TimeFilterableDataSourceOptions
  );

  readonly color = input('primary');

  readonly header = input(true);

  public timeFilterCollapse = false;

  get badge() {
    const filter = this.options().timeFilter;
    if (filter && filter.enabled && filter.value) {
      return 1;
    } else {
      return;
    }
  }
}

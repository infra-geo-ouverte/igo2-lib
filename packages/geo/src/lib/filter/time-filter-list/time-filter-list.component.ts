import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ListComponent, ListItemDirective } from '@igo2/common/list';

import { AnyLayer } from '../../layer';
import { FilterableDataSourcePipe } from '../shared/filterable-datasource.pipe';
import { TimeFilterItemComponent } from '../time-filter-item/time-filter-item.component';

@Component({
    selector: 'igo-time-filter-list',
    templateUrl: './time-filter-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ListComponent,
        NgFor,
        TimeFilterItemComponent,
        ListItemDirective,
        FilterableDataSourcePipe
    ]
})
export class TimeFilterListComponent {
  @Input() layers: AnyLayer[] = [];
}

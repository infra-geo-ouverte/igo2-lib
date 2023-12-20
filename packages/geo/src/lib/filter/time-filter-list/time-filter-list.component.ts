import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input
} from '@angular/core';

import { Layer } from '../../layer/shared/layers/layer';
import { FilterableDataSourcePipe } from '../shared/filterable-datasource.pipe';
import { ListItemDirective } from '../../../../../common/src/lib/list/list-item.directive';
import { TimeFilterItemComponent } from '../time-filter-item/time-filter-item.component';
import { NgFor } from '@angular/common';
import { ListComponent } from '../../../../../common/src/lib/list/list.component';

@Component({
    selector: 'igo-time-filter-list',
    templateUrl: './time-filter-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [ListComponent, NgFor, TimeFilterItemComponent, ListItemDirective, FilterableDataSourcePipe]
})
export class TimeFilterListComponent {
  @Input()
  get layers(): Layer[] {
    return this._layers;
  }
  set layers(value: Layer[]) {
    this._layers = value;
    this.cdRef.detectChanges();
  }
  private _layers: Layer[] = [];

  constructor(private cdRef: ChangeDetectorRef) {}
}

import { NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input
} from '@angular/core';

import { ListComponent, ListItemDirective } from '@igo2/common';

import { Layer } from '../../layer/shared/layers/layer';
import { FilterableDataSourcePipe } from '../shared/filterable-datasource.pipe';
import { TimeFilterItemComponent } from '../time-filter-item/time-filter-item.component';

@Component({
  selector: 'igo-time-filter-list',
  templateUrl: './time-filter-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ListComponent,
    NgFor,
    TimeFilterItemComponent,
    ListItemDirective,
    FilterableDataSourcePipe
  ]
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

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IgoMap } from '../../map';
import { Layer, FilterableLayer } from '../../layer';

@Component({
  selector: 'igo-time-filter-list',
  templateUrl: './time-filter-list.component.html',
  styleUrls: ['./time-filter-list.component.styl']
})
export class TimeFilterListComponent implements OnInit, OnDestroy {

  @Input()
  get map(): IgoMap { return this._map; }
  set map(value: IgoMap) {
    this._map = value;
  }
  private _map: IgoMap;

  public layers: FilterableLayer[];
  public layers$$: Subscription;

  constructor() {}

  ngOnInit() {
    this.layers$$ = this.map.layers$.subscribe(
      (layers: Layer[]) => this.handleLayersChanged(layers));
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

  handleLayersChanged(layers: Layer[]) {
    this.layers = layers.filter(layer => {
      return layer.isFilterable() && layer.options.timeFilter !== undefined;
    }) as any[] as FilterableLayer[];
  }
}

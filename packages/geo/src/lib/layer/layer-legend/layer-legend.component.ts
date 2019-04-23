import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { Subscription, BehaviorSubject } from 'rxjs';

import { DataSourceLegendOptions } from '../../datasource/shared/datasources/datasource.interface';
import { Layer } from '../shared/layers';

@Component({
  selector: 'igo-layer-legend',
  templateUrl: './layer-legend.component.html',
  styleUrls: ['./layer-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerLegendComponent implements OnInit, OnDestroy {

  /**
   * Observable of the legend items
   */
  legendItems$: BehaviorSubject<DataSourceLegendOptions[]> = new BehaviorSubject([]);

  /**
   * Subscription to the map's resolution
   */
  private resolution$$: Subscription;

  /**
   * Layer
   */
  @Input() layer: Layer;

  constructor() {}

  /**
   * On init, subscribe to the map's resolution and update the legend accordingly
   */
  ngOnInit() {
    const resolution$ = this.layer.map.viewController.resolution$;
    this.resolution$$ = resolution$.subscribe((resolution: number) => {
      this.onResolutionChange(resolution);
    });
  }

  /**
   * On destroy, unsubscribe to the map,s resolution
   */
  ngOnDestroy() {
    this.resolution$$.unsubscribe();
  }

  /**
   * On resolution change, compute the effective scale level and update the
   * legend accordingly.
   */
  private onResolutionChange(resolution: number) {
    const scale = this.layer.map.viewController.getScale();
    const legendItems = this.layer.dataSource.getLegend(scale);
    if (legendItems.length === 0 && this.legendItems$.value.length === 0) {
      return;
    }
    this.legendItems$.next(legendItems);
  }

}

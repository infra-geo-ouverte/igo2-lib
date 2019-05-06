import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { Subscription, BehaviorSubject, of, Observable } from 'rxjs';

import { DataSourceLegendOptions } from '../../datasource/shared/datasources/datasource.interface';
import { Layer } from '../shared/layers';
import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'igo-layer-legend',
  templateUrl: './layer-legend.component.html',
  styleUrls: ['./layer-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerLegendComponent implements OnInit, OnDestroy {

  @Input() updateLegendOnResolutionChange: boolean = false;

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

  constructor(private capabilitiesService: CapabilitiesService) {}

  /**
   * On init, subscribe to the map's resolution and update the legend accordingly
   */
  ngOnInit() {
    if (this.updateLegendOnResolutionChange === true) {
      const resolution$ = this.layer.map.viewController.resolution$;
      this.resolution$$ = resolution$.subscribe((resolution: number) => this.onResolutionChange(resolution));
    } else {
      this.updateLegend(undefined);
    }
  }

  /**
   * On destroy, unsubscribe to the map,s resolution
   */
  ngOnDestroy() {
    if (this.resolution$$ !== undefined) {
      this.resolution$$.unsubscribe();
    }
  }

  computeItemTitle(layerLegend): Observable<string> {
    const layerOptions = this.layer.dataSource.options as any;
    if (layerOptions.type !== 'wms') {
      return of(layerLegend.title);
    }

    const layers = layerOptions.params.layers.split(',');
    const localLayerOptions = JSON.parse(JSON.stringify(layerOptions)); // to avoid to alter the original options.
    localLayerOptions.params.layers = layers.find(layer => layer === layerLegend.title);
    return this.capabilitiesService
      .getWMSOptions(localLayerOptions)
      .pipe(map(wmsDataSourceOptions => {
        return wmsDataSourceOptions._layerOptionsFromCapabilities.title;
      }));
  }

  /**
   * On resolution change, compute the effective scale level and update the
   * legend accordingly.
   * @param resolutione Map resolution
   */
  private onResolutionChange(resolution: number) {
    const scale = this.layer.map.viewController.getScale();
    this.updateLegend(scale);
  }

  /**
   * Update the legend according the scale level
   * @param scale Map scale level
   */
  private updateLegend(scale: number | undefined) {
    const legendItems = this.layer.dataSource.getLegend(scale);
    if (legendItems.length === 0 && this.legendItems$.value.length === 0) {
      return;
    }
    this.legendItems$.next(legendItems);
  }
}

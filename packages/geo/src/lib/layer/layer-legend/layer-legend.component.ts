import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { Subscription, BehaviorSubject, of, Observable } from 'rxjs';

import { Legend, DataSourceOptions } from '../../datasource/shared/datasources/datasource.interface';
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
  legendItems$: BehaviorSubject<Legend[]> = new BehaviorSubject([]);

  /**
   * Subscription to the map's resolution
   */
  private resolution$$: Subscription;

  // hb? public, $$
  public currentStyle = '';

  private scale: number = undefined;

  /**
   * Layer
   */
  @Input() layer: Layer;

  constructor(private capabilitiesService: CapabilitiesService) {}

  /**
   * On init, subscribe to the map's resolution and update the legend accordingly
   */
  ngOnInit() {
    // hb-note on recupére la dernière légende et son style. La légende doit être refait car la résolution peut avoir bouger depuis.
    let lastlLegend = this.layer.legend;
    const listStyles = this.listStyles();

    if (!this.layer.legend) {
      if (listStyles && listStyles.length > 1) {
        this.currentStyle = this.layer.options.legendOptions.stylesAvailable[0].name;
      }
      lastlLegend = this.layer.dataSource.getLegend(this.currentStyle, this.scale);
    } else if (listStyles && listStyles.length > 1) {
        this.currentStyle = lastlLegend[0].currentStyle;
    }

    if (this.updateLegendOnResolutionChange === true) {
      const resolution$ = this.layer.map.viewController.resolution$;
      this.resolution$$ = resolution$.subscribe((resolution: number) => this.onResolutionChange(resolution));
    } else if (lastlLegend.length !== 0) {
        this.legendItems$.next(lastlLegend);
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
   * @param resolution Map resolution
   */
  private onResolutionChange(resolution: number) {
    this.scale = this.layer.map.viewController.getScale();
    this.updateLegend();
  }

  /**
   * Update the legend with scale level and style define
   */
  private updateLegend() {
    const legendItems = this.layer.dataSource.getLegend(this.currentStyle, this.scale);
    this.layer.legend = legendItems;
    if (legendItems.length === 0 && this.legendItems$.value.length === 0) {
      return;
    }
    this.legendItems$.next(legendItems);
  }

  listStyles() {
    const layerOptions = this.layer.options;
    if (layerOptions !== undefined || layerOptions) {
      if (layerOptions.legendOptions !== undefined || layerOptions.legendOptions) {
        return layerOptions.legendOptions.stylesAvailable;
      }
    }
    return ;
  }

  onChangeStyle() {
    this.updateLegend();
    this.layer.dataSource.ol.updateParams({STYLES: this.currentStyle});
  }
}

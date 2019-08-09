import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChildren, ElementRef, QueryList } from '@angular/core';

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

  /**
   * The style used to make the legend
   */
  public currentStyle = '';

  /**
   * The scale used to make the legend
   */
  private scale: number = undefined;

  /**
   * Get list of images display
   */
  @ViewChildren('renderedLegend') renderedLegends: QueryList<ElementRef>;

  /**
   * List of size of images displayed
   */
  public imagesHeight: { [srcKey: string]: number } = {};

  /**
   * Layer
   */
  @Input() layer: Layer;

  constructor(private capabilitiesService: CapabilitiesService) {}

  /**
   * On init, subscribe to the map's resolution and update the legend accordingly
   */
  ngOnInit() {
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

  toggleLegendItem(collapsed: boolean, item: Legend) {
    item.collapsed = collapsed;
  }

  private transfertToggleLegendItem(newLegends: Legend[]): Legend[] {
    const outLegends: Legend[] = newLegends;
    const lastLegends = this.layer.legend;
    for (let i = 0; i < lastLegends.length; i++) {
      outLegends[i].collapsed = lastLegends[i].collapsed;
   }
    return outLegends;
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
    let legendItems = this.layer.dataSource.getLegend(this.currentStyle, this.scale);
    if (this.layer.legend && this.layer.legend.length > 1) { legendItems = this.transfertToggleLegendItem(legendItems); }
    this.layer.legend = legendItems;

    if (legendItems.length === 0 && this.legendItems$.value.length === 0) {
      return;
    }
    this.legendItems$.next(legendItems);
  }

  listStyles() {
    const layerOptions = this.layer.options;
    if (layerOptions && layerOptions.legendOptions) {
        return layerOptions.legendOptions.stylesAvailable;
    }
    return ;
  }

  onChangeStyle() {
    this.updateLegend();
    this.layer.dataSource.ol.updateParams({STYLES: this.currentStyle});
  }

  onLoadImage(id: string) {
    let elemRef: HTMLImageElement;
    if (this.renderedLegends.length === 1) {
      elemRef = this.renderedLegends.first.nativeElement as HTMLImageElement;
    } else {
      elemRef = this.renderedLegends.find(renderedLegend => renderedLegend.nativeElement.id === id).nativeElement as HTMLImageElement;
    }
    this.imagesHeight[id] = elemRef.height;
  }
}

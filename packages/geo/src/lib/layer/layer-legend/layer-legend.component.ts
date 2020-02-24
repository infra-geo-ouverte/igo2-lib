import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ViewChildren, ElementRef, QueryList } from '@angular/core';

import { Subscription, BehaviorSubject, of, Observable } from 'rxjs';

import { Legend } from '../../datasource/shared/datasources/datasource.interface';
import { Layer, ItemStyleOptions } from '../shared/layers';
import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import { map } from 'rxjs/operators';
import { LanguageService } from '@igo2/core';

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
   * The available styles
   */
  public styles;

  /**
   * The style used to make the legend
   */
  public currentStyle;

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

  constructor(
    private capabilitiesService: CapabilitiesService,
    private languageService: LanguageService) {}

  /**
   * On init, subscribe to the map's resolution and update the legend accordingly
   */
  ngOnInit() {
    let lastlLegend = this.layer.legend;
    this.styles = this.listStyles();
    const sourceOptions = this.layer.options.source.options as any;
    if (
      sourceOptions &&
      sourceOptions.params &&
      sourceOptions.params.STYLES) {
      // if a styles is provided into the layers wms params
      this.currentStyle = this.styles.find(style => style.name === sourceOptions.params.STYLES).name;
    } else if (!this.layer.legend) {
      // if no legend is manually provided
      if (this.styles && this.styles.length > 1) {
        this.currentStyle = this.styles[0].name;
      }
    } else if (this.styles && this.styles.length > 1) {
      this.currentStyle = lastlLegend[0].currentStyle;
    }

    lastlLegend = this.layer.dataSource.getLegend(this.currentStyle, this.scale);
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

    const layers = layerOptions.params.LAYERS.split(',');
    const localLayerOptions = JSON.parse(JSON.stringify(layerOptions)); // to avoid to alter the original options.
    localLayerOptions.params.LAYERS = layers.find(layer => layer === layerLegend.title);
    return this.capabilitiesService
      .getWMSOptions(localLayerOptions)
      .pipe(map(wmsDataSourceOptions => {
        return wmsDataSourceOptions._layerOptionsFromSource.title;
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

  private listStyles() {
    const layerOptions = this.layer.options;
    if (layerOptions && layerOptions.legendOptions) {
      const translate = this.languageService.translate;
      const title = translate.instant('igo.geo.layer.legend.default');
      const stylesAvailable =  [{ name: '', title } as ItemStyleOptions]
        .concat(layerOptions.legendOptions.stylesAvailable.filter(sA => (
          sA.name.normalize('NFD').replace(/[\u0300-\u036f]/gi, '') !== 'default' &&
          sA.name.normalize('NFD').replace(/[\u0300-\u036f]/gi, '') !== 'defaut')));
      stylesAvailable.map(s => s.title = s.title.charAt(0).toUpperCase() + s.title.slice(1).replace(/_/g, ' '));
      return stylesAvailable;
    }
    return ;
  }

  onChangeStyle() {
    this.updateLegend();
    let STYLES = '';
    this.layer.dataSource.ol.getParams().LAYERS.split(',').map(layer =>
      STYLES += this.currentStyle + ','
    );
    STYLES = STYLES.slice(0, -1);
    this.layer.dataSource.ol.updateParams({STYLES});
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

import { AsyncPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChildren
} from '@angular/core';
import type { QueryList } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CollapseDirective } from '@igo2/common/collapsible';
import { SanitizeHtmlPipe } from '@igo2/common/custom-html';
import { ImageErrorDirective, SecureImagePipe } from '@igo2/common/image';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import { Legend } from '../../datasource/shared/datasources/datasource.interface';
import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { WMSDataSourceOptions } from '../../datasource/shared/datasources/wms-datasource.interface';
import { Layer } from '../shared/layers/layer';
import {
  ItemStyleOptions,
  LegendMapViewOptions
} from '../shared/layers/legend.interface';

@Component({
  selector: 'igo-layer-legend',
  templateUrl: './layer-legend.component.html',
  styleUrls: ['./layer-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatListModule,
    MatIconModule,
    CollapseDirective,
    NgClass,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    MatOptionModule,
    ImageErrorDirective,
    NgStyle,
    AsyncPipe,
    IgoLanguageModule,
    SanitizeHtmlPipe
  ]
})
export class LayerLegendComponent implements OnInit, OnDestroy {
  @Input() updateLegendOnResolutionChange = false;

  /**
   * Observable of the legend items
   */
  legendItems$ = new BehaviorSubject<Legend[]>([]);

  /**
   * Subscription to the map's resolution
   */
  private state$$: Subscription;

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
   * The extent used to make the legend
   */
  private view: LegendMapViewOptions = undefined;
  /**
   * Get list of images display
   */
  @ViewChildren('renderedLegend') renderedLegends: QueryList<ElementRef>;

  /**
   * List of size of images displayed
   */
  public imagesHeight: Record<string, number> = {};

  /**
   * Layer
   */
  @Input() layer: Layer;

  /**
   * if getLegendGraphic is authorized
   */
  public getLegend = true;

  /**
   * activeLegend
   */

  constructor(
    private capabilitiesService: CapabilitiesService,
    private languageService: LanguageService,
    private configService: ConfigService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * On init, subscribe to the map's resolution and update the legend accordingly
   */
  ngOnInit() {
    let lastlLegend = this.layer.legend;
    this.styles = this.listStyles();
    const sourceOptions = this.layer.options.source.options as any;
    if (sourceOptions && sourceOptions.params && sourceOptions.params.STYLES) {
      // if a styles is provided into the layers wms params
      this.currentStyle = this.styles.find(
        (style) => style.name === sourceOptions.params.STYLES
      ).name;
    } else if (!lastlLegend) {
      // if no legend is manually provided
      if (this.styles && this.styles.length > 1) {
        this.currentStyle = this.styles[0].name;
      }
    } else if (this.styles && this.styles.length > 1) {
      this.currentStyle = lastlLegend[0].currentStyle;
    }
    if (
      typeof this.layer.options.legendOptions !== 'undefined' &&
      this.layer.options.legendOptions.display === false
    ) {
      lastlLegend = [];
    } else {
      lastlLegend = this.layer.dataSource.getLegend(
        this.currentStyle,
        this.view
      );
    }

    if (
      this.updateLegendOnResolutionChange ||
      (sourceOptions as WMSDataSourceOptions).contentDependentLegend
    ) {
      const state$ = this.layer.map.viewController.state$;
      this.state$$ = state$.subscribe(() => this.onViewControllerStateChange());
    } else if (lastlLegend && lastlLegend.length !== 0) {
      this.legendItems$.next(lastlLegend);
      for (const legend of lastlLegend) {
        this.getLegendGraphic(legend);
      }
    }
  }

  /**
   * On destroy, unsubscribe to the map's view state
   */
  ngOnDestroy() {
    if (this.state$$ !== undefined) {
      this.state$$.unsubscribe();
    }
  }

  getLegendGraphic(item: Legend) {
    if (item.url) {
      const secureIMG = new SecureImagePipe(this.http, this.configService);
      secureIMG
        .transform(item.url)
        .pipe(
          catchError((err) => {
            if (err.error) {
              err.error.caught = true;
              this.getLegend = false;
              this.cdRef.detectChanges();
              return err;
            }
          })
        )
        .subscribe((obsLegGraph) => {
          const idx = this.legendItems$.value.findIndex(
            (leg) => leg.title === item.title
          );
          const legendGraph = obsLegGraph as string;
          this.legendItems$.value[idx].imgGraphValue = legendGraph;
          this.cdRef.detectChanges();
        });
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
    localLayerOptions.params.LAYERS = layers.find(
      (layer) => layer === layerLegend.title
    );
    return this.capabilitiesService.getWMSOptions(localLayerOptions).pipe(
      map((wmsDataSourceOptions) => {
        return wmsDataSourceOptions._layerOptionsFromSource.title;
      })
    );
  }

  /**
   * On resolution change, compute the effective scale level and update the
   * legend accordingly.
   * @param resolution Map resolution
   */
  private onViewControllerStateChange() {
    this.view = {
      resolution: this.layer.map.viewController.getResolution(),
      extent: this.layer.map.viewController.getExtent(),
      projection: this.layer.map.viewController.getOlProjection().getCode(),
      scale: this.layer.map.viewController.getScale(),
      size: this.layer.map.ol.getSize()
    } as LegendMapViewOptions;
    this.updateLegend();
  }

  /**
   * Update the legend with scale level and style define
   */
  private updateLegend() {
    let legendItems = this.layer.dataSource.getLegend(
      this.currentStyle,
      this.view
    );
    if (this.layer.legend && this.layer.legend.length > 1) {
      legendItems = this.transfertToggleLegendItem(legendItems);
    }
    this.layer.legend = legendItems;

    if (legendItems.length === 0 && this.legendItems$.value.length === 0) {
      return;
    }
    this.legendItems$.next(legendItems);
    for (const legend of this.legendItems$.value) {
      this.getLegendGraphic(legend);
    }
  }

  private listStyles() {
    const layerOptions = this.layer.options;
    if (layerOptions && layerOptions.legendOptions) {
      const translate = this.languageService.translate;
      const title = translate.instant('igo.geo.layer.legend.default');
      let stylesAvailable = [{ name: '', title } as ItemStyleOptions];
      if (layerOptions.legendOptions.stylesAvailable) {
        stylesAvailable = stylesAvailable.concat(
          layerOptions.legendOptions.stylesAvailable.filter(
            (sA) =>
              sA.name.normalize('NFD').replace(/[\u0300-\u036f]/gi, '') !==
                'default' &&
              sA.name.normalize('NFD').replace(/[\u0300-\u036f]/gi, '') !==
                'defaut'
          )
        );
      }
      stylesAvailable
        .filter((sa) => !sa.title)
        .map((sa) => (sa.title = sa.name));
      stylesAvailable.map(
        (s) =>
          (s.title =
            s.title.charAt(0).toUpperCase() +
            s.title.slice(1).replace(/_/g, ' '))
      );
      return stylesAvailable;
    }
    return;
  }

  onChangeStyle() {
    this.updateLegend();
    let STYLES = '';
    if (this.layer.dataSource instanceof WMSDataSource) {
      this.layer.dataSource.ol
        .getParams()
        .LAYERS.split(',')
        .map((layer) => (STYLES += this.currentStyle + ','));
      STYLES = STYLES.slice(0, -1);
      this.layer.dataSource.ol.updateParams({ STYLES });
    }
  }

  onLoadImage(id: string) {
    let elemRef: HTMLImageElement;
    if (this.renderedLegends.length === 1) {
      elemRef = this.renderedLegends.first.nativeElement as HTMLImageElement;
    } else {
      elemRef = this.renderedLegends.find(
        (renderedLegend) => renderedLegend.nativeElement.id === id
      ).nativeElement as HTMLImageElement;
    }
    this.imagesHeight[id] = elemRef.height;
  }
}

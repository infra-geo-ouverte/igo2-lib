import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatOptionModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';
import { WMSDataSourceOptions } from '@igo2/geo';

import { BehaviorSubject, Subscription } from 'rxjs';

import { WMSDataSource } from '../../../datasource/shared/datasources/wms-datasource';
import { Layer } from '../../shared';
import { Legend } from '../../shared/layers/legend.interface';

@Component({
  selector: 'igo-layer-legend-wms-selector',
  templateUrl: './layer-legend-wms-selector.component.html',
  styleUrls: ['./layer-legend-wms-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgFor,
    MatListModule,
    NgClass,
    MatSelectModule,
    MatOptionModule,
    MatTooltipModule,
    AsyncPipe,
    IgoLanguageModule
  ]
})
export class LayerLegendWmsSelectorComponent implements OnInit, OnDestroy {
  @Input() layer: Layer;
  @Input() currentLegend$ = new BehaviorSubject<Legend>(undefined);
  public legends$ = new BehaviorSubject<Legend[]>([]);
  private subscriptions$$: Subscription[] = [];

  get dataSource() {
    return this.layer?.dataSource as WMSDataSource;
  }

  constructor() {}

  validateLayerDatasource() {
    if (!(this.dataSource instanceof WMSDataSource)) {
      throw new Error(
        'LayerLegendWmsSelectorComponent can only be used with WMS layers'
      );
    }
  }

  ngOnInit() {
    this.validateLayerDatasource();
    const sub = this.layer.legends$.subscribe((legends) => {
      this.legends$.next(legends);
      this.computeCurrentLegend(legends);
    });
    this.subscriptions$$.push(sub);
  }

  computeCurrentLegend(legends: Legend[]) {
    if (legends.length === 1) {
      this.currentLegend$.next(legends[0]);
    } else {
      const appliedWmsStyle = this.dataSource.options.params.STYLES;
      let legendToSelect: Legend;
      if (appliedWmsStyle) {
        legendToSelect = legends.find((l) =>
          l.urls.some((url) =>
            url.toLowerCase().includes(`style=${appliedWmsStyle}`)
          )
        );
      } else {
        legendToSelect = legends.find((l) =>
          l.urls.every((url) => !url.toLowerCase().includes(`style=`))
        );
      }
      if (legendToSelect) {
        this.currentLegend$.next(legendToSelect);
        return;
      }

      this.currentLegend$.next(legends[0]);
    }
  }

  /**
   * On destroy, unsubscribe to the map's view state
   */
  ngOnDestroy() {
    this.subscriptions$$.forEach((f) => f.unsubscribe());
  }

  onChangeLegend(event: MatSelectChange) {
    const newLegend: Legend = event.value;
    newLegend.urls?.forEach((url) => {
      if (this.isWmsGetLegend(url)) {
        const wmsStyleToApply = this.getStyleFromGetLegendGraphic(url);
        this.setWmsStyle(wmsStyleToApply);
      }
    });
    this.currentLegend$.next(newLegend);
  }

  isWmsGetLegend(originalUrl: string) {
    const absUrl =
      originalUrl.charAt(0) === '/'
        ? window.location.origin + originalUrl
        : originalUrl;
    const url = new URL(absUrl.toLowerCase());
    const params = new URLSearchParams(url.search);

    return (
      params.get('version') !== null &&
      params.get('service') === 'wms' &&
      params.get('request') === 'getlegendgraphic' &&
      params.get('layer') !== null &&
      params.get('format') !== null
    );
  }

  getStyleFromGetLegendGraphic(originalUrl: string) {
    const absUrl =
      originalUrl.charAt(0) === '/'
        ? window.location.origin + originalUrl
        : originalUrl;
    if (this.isWmsGetLegend(absUrl)) {
      const url = new URL(absUrl.toLowerCase());
      const params = new URLSearchParams(url.search);
      return params.get('style') ?? params.get('STYLE');
    }
    return;
  }

  setWmsStyle(wmsStyleToApply: string) {
    this.dataSource.stylesParams = wmsStyleToApply;
  }
}

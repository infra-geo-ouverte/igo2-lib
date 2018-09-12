import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Layer } from '../../layer/shared/layers/layer';
import { MapService } from '../../map/shared/map.service';
import { DownloadService } from '../../download/shared/download.service';

import {
  OgcFilterableDataSource,
  OgcFiltersOptions
} from '../shared/ogc-filter.interface';
import { OGCFilterService } from '../shared/ogc-filter.service';
import { IgoMap } from '../../map';

@Component({
  selector: 'igo-ogc-filterable-item',
  templateUrl: './ogc-filterable-item.component.html',
  styleUrls: ['./ogc-filterable-item.component.scss']
})
export class OgcFilterableItemComponent implements OnInit {
  public color = 'primary';
  private lastRunOgcFilter;
  private defaultLogicalParent = 'And';

  @Input()
  get layer(): Layer {
    return this._layer;
  }
  set layer(value: Layer) {
    this._layer = value;
  }

  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
  }

  get refreshFunc() {
    return this.refreshFilters.bind(this);
  }
  @Input()
  get showFeatureOnMap(): boolean {
    return this._showFeatureOnMap;
  }
  set showFeatureOnMap(value: boolean) {
    this._showFeatureOnMap = value;
  }

  public _showFeatureOnMap = false;
  private _map: IgoMap;
  private _layer: Layer;

  get datasource(): OgcFilterableDataSource {
    return this.layer.dataSource as OgcFilterableDataSource;
  }

  @Input()
  get ogcFiltersHeaderShown(): boolean {
    return this._ogcFiltersHeaderShown;
  }
  set ogcFiltersHeaderShown(value: boolean) {
    this._ogcFiltersHeaderShown = value;
  }
  private _ogcFiltersHeaderShown: boolean;

  constructor(
    private ogcFilterService: OGCFilterService,
    private mapService: MapService,
    private downloadService: DownloadService
  ) {}

  ngOnInit() {
    this.ogcFilterService.getSourceFields(this.datasource);
    this.ogcFilterService.setOgcWFSFiltersOptions(this.datasource);

    if (
      this.datasource.options.ogcFilters &&
      this.datasource.options.ogcFilters.interfaceOgcFilters
    ) {
      this.lastRunOgcFilter = JSON.parse(
        JSON.stringify(this.datasource.options.ogcFilters.interfaceOgcFilters)
      );
    }

    // this.datasource.options['diskableRefreshFilter'] = true;
  }

  toggleShowFeatureOnMap() {
    this.showFeatureOnMap = !this.showFeatureOnMap;
    this.datasource.options.ogcFilters.interfaceOgcFilters.forEach(filter => {
      let drawnFeature;
      let drawnStrokeColor = [125, 136, 140, 0] as [number, number, number, number];
      let drawStrokeWidth = 2;
      let drawnFillColor = [125, 136, 140, 0]as [number, number, number, number];

      if (this.showFeatureOnMap === false) {
        drawnFeature = this.map.getOverlayByID('ogcFilterOverlay_' + filter.filterid);
      } else {
        drawnFeature = this.map.getOverlayByID('ogcFilterOverlay_' + filter.filterid);
        drawnStrokeColor = [125, 136, 140, 0.5];
        drawStrokeWidth = 2;
        drawnFillColor = [125, 136, 140, 0];
      }
      if (drawnFeature) {
        drawnFeature.setStyle(this.map.setOverlayDataSourceStyle(drawnStrokeColor, drawStrokeWidth, drawnFillColor));
      }
    });




  }

  addFilterToSequence() {
    const arr = this.datasource.options.ogcFilters.interfaceOgcFilters;
    const lastLevel = arr.length === 0 ? 0 : arr[arr.length - 1].level;
    let firstFieldName = '';
    if (this.datasource.options.sourceFields.length > 0) {
      firstFieldName =
        this.datasource.options.sourceFields[0].name === undefined
          ? ''
          : this.datasource.options.sourceFields[0].name;
    }
    let fieldNameGeometry;
    if (this.datasource.options['fieldNameGeometry']) {
      fieldNameGeometry = this.datasource.options['fieldNameGeometry'];
    } else if (
      this.datasource.options['wfsSource'] &&
      this.datasource.options['wfsSource']['fieldNameGeometry']
    ) {
      fieldNameGeometry = this.datasource.options['wfsSource'][
        'fieldNameGeometry'
      ];
    }
    const status = arr.length === 0 ? true : false;
    arr.push(
      this.datasource['ogcFilterWriter'].addInterfaceFilter(
        {
          propertyName: firstFieldName,
          operator: 'PropertyIsEqualTo',
          active: status,
          igoSpatialSelector: 'fixedExtent'
        },
        fieldNameGeometry,
        lastLevel,
        this.defaultLogicalParent
      )
    );
    this.datasource.options.ogcFilters.interfaceOgcFilters = arr;
  }

  openDownload() {
    this.downloadService.open(this.layer);
  }

  refreshFilters() {
    const ogcFilters: OgcFiltersOptions = this.datasource.options.ogcFilters;
    const activeFilters = ogcFilters.interfaceOgcFilters.filter(
      f => f.active === true
    );
    if (activeFilters.length > 1) {
      activeFilters[0].parentLogical = activeFilters[1].parentLogical;
    }
    if (
      !(JSON.stringify(this.lastRunOgcFilter) === JSON.stringify(activeFilters))
    ) {
      if (this.layer.dataSource.options.type === 'wfs') {
        const ogcDataSource: any = this.layer.dataSource;
        const ogcLayer: OgcFiltersOptions = ogcDataSource.options.ogcFilters;
        const writer = ogcDataSource.ogcFilterWriter;
        ogcLayer.filters = writer.rebuiltIgoOgcFilterObjectFromSequence(
          activeFilters
        );
        this.layer.dataSource.ol.clear();
      } else if (
        this.layer.dataSource.options.type === 'wms' &&
        (this.layer.dataSource.options['ogcFilters'] as any).enabled
      ) {
        let rebuildFilter = '';
        if (activeFilters.length >= 1) {
          const ogcDataSource: any = this.layer.dataSource;
          const ogcLayer: OgcFiltersOptions = ogcDataSource.options.ogcFilters;
          const writer = ogcDataSource.ogcFilterWriter;
          ogcLayer.filters = writer.rebuiltIgoOgcFilterObjectFromSequence(
            activeFilters
          );
          rebuildFilter = (this.layer
            .dataSource as any).ogcFilterWriter.buildFilter(
            ogcLayer.filters,
            undefined,
            undefined,
            this.layer.dataSource.options['fieldNameGeometry']
          );
        }
        (this.layer.dataSource as any).filterByOgc(rebuildFilter);
        this.datasource.options['ogcFiltered'] =
          activeFilters.length === 0 ? false : true;
      }

      this.lastRunOgcFilter = JSON.parse(JSON.stringify(activeFilters));
      // this.datasource.options['dislableRefreshFilter'] = true;
    } else {
      // identical filter. Nothing triggered
      // this.datasource.options['disableRefrkeshFilter'] = true;
    }
  }

  get downloadable() {
    return (this.datasource.options as any).download;
  }
}

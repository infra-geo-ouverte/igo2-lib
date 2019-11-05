import { Component, Input, OnInit } from '@angular/core';

import * as olstyle from 'ol/style';

import { Layer } from '../../layer/shared/layers/layer';
import { DownloadService } from '../../download/shared/download.service';
import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { WFSDataSourceOptionsParams } from '../../datasource/shared/datasources/wfs-datasource.interface';

import {
  OgcFilterableDataSource,
  OgcFiltersOptions,
  OgcInterfaceFilterOptions
} from '../shared/ogc-filter.interface';
import { OGCFilterService } from '../shared/ogc-filter.service';
import { IgoMap } from '../../map';
import { OgcFilterWriter } from '../shared/ogc-filter';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'igo-ogc-filterable-item',
  templateUrl: './ogc-filterable-item.component.html',
  styleUrls: ['./ogc-filterable-item.component.scss']
})
export class OgcFilterableItemComponent implements OnInit {
  public color = 'primary';
  private lastRunOgcFilter;
  private defaultLogicalParent = 'And';
  public hasActiveSpatialFilter = false;
  public filtersAreEditable = true;
  public filtersCollapsed = true;
  public hasPushButton: boolean = false;
  showLegend$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  @Input() layer: Layer;

  @Input() map: IgoMap;

  @Input() header: boolean = true;

  get refreshFunc() {
    return this.refreshFilters.bind(this);
  }

  get datasource(): OgcFilterableDataSource {
    return this.layer.dataSource as OgcFilterableDataSource;
  }

  get downloadable() {
    return (this.datasource.options as any).download;
  }

  constructor(
    private ogcFilterService: OGCFilterService,
    private downloadService: DownloadService
  ) {}

  ngOnInit() {
    const ogcFilters = this.datasource.options.ogcFilters;
    if (ogcFilters.pushButtons && ogcFilters.pushButtons.bundles.length > 0) {
      if (ogcFilters.advancedOgcFilters === undefined) {
        ogcFilters.advancedOgcFilters = false;
      }
      this.hasPushButton = true;
    }

    switch (this.datasource.options.type) {
      case 'wms':
        this.ogcFilterService.setOgcWMSFiltersOptions(this.datasource);
        break;
      case 'wfs':
        this.ogcFilterService.setOgcWFSFiltersOptions(this.datasource);
        break;
      default:
        break;
    }

    if (ogcFilters) {
      if (ogcFilters.interfaceOgcFilters) {
        this.lastRunOgcFilter = JSON.parse(
          JSON.stringify(ogcFilters.interfaceOgcFilters)
        );
        if (
          ogcFilters.interfaceOgcFilters.filter(f => f.wkt_geometry).length >= 1
        ) {
          this.hasActiveSpatialFilter = true;
        }
      }

      this.filtersAreEditable = ogcFilters.editable
        ? ogcFilters.editable
        : false;
    }
  }

  addFilterToSequence() {
    this.filtersCollapsed = false;
    const interfaceOgcFilters: OgcInterfaceFilterOptions[] = this.datasource
      .options.ogcFilters.interfaceOgcFilters;
    const arr = interfaceOgcFilters || [];
    const lastLevel = arr.length === 0 ? 0 : arr[arr.length - 1].level;
    let firstFieldName = '';
    if (this.datasource.options.sourceFields.length > 0) {
      firstFieldName =
        this.datasource.options.sourceFields[0].name === undefined
          ? ''
          : this.datasource.options.sourceFields[0].name;
    }
    let fieldNameGeometry;
    const datasourceOptions = this.datasource
      .options as WFSDataSourceOptionsParams;
    if (datasourceOptions.fieldNameGeometry) {
      fieldNameGeometry = datasourceOptions.fieldNameGeometry;
    } else if (
      (this.datasource.options as any).paramsWFS &&
      (this.datasource.options as any).paramsWFS.fieldNameGeometry
    ) {
      fieldNameGeometry = (this.datasource.options as any).paramsWFS
        .fieldNameGeometry;
    }
    const status = arr.length === 0 ? true : false;
    arr.push(
      new OgcFilterWriter().addInterfaceFilter(
        {
          propertyName: firstFieldName,
          operator: 'PropertyIsEqualTo',
          active: status,
          igoSpatialSelector: 'fixedExtent'
        } as OgcInterfaceFilterOptions,
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

  refreshFilters(force?: boolean) {
    if (force === true) {
      this.lastRunOgcFilter = undefined;
    }
    const ogcFilters: OgcFiltersOptions = this.datasource.options.ogcFilters;
    const ogcFilterWriter = new OgcFilterWriter();
    const activeFilters = ogcFilters.interfaceOgcFilters.filter(
      f => f.active === true
    );
    if (activeFilters.length === 0) {
      ogcFilters.filters = undefined;
      ogcFilters.filtered = false;
    }
    if (activeFilters.length > 1) {
      activeFilters[0].parentLogical = activeFilters[1].parentLogical;
    }
    if (
      activeFilters.filter(
        af => ['Contains', 'Intersects', 'Within'].indexOf(af.operator) !== -1
      ).length === 0
    ) {
      this.hasActiveSpatialFilter = false;
    } else {
      this.hasActiveSpatialFilter = true;
    }

    if (
      !(JSON.stringify(this.lastRunOgcFilter) === JSON.stringify(activeFilters))
    ) {
      if (this.layer.dataSource.options.type === 'wfs') {
        const ogcDataSource: any = this.layer.dataSource;
        const ogcLayer: OgcFiltersOptions = ogcDataSource.options.ogcFilters;
        ogcLayer.filters = ogcFilterWriter.rebuiltIgoOgcFilterObjectFromSequence(
          activeFilters
        );
        this.layer.dataSource.ol.clear();
      } else if (
        this.layer.dataSource.options.type === 'wms' &&
        ogcFilters.enabled
      ) {
        let rebuildFilter = '';
        if (activeFilters.length >= 1) {
          const ogcDataSource: any = this.layer.dataSource;
          const ogcLayer: OgcFiltersOptions = ogcDataSource.options.ogcFilters;
          ogcLayer.filters = ogcFilterWriter.rebuiltIgoOgcFilterObjectFromSequence(
            activeFilters
          );
          rebuildFilter = ogcFilterWriter.buildFilter(
            ogcLayer.filters,
            undefined,
            undefined,
            (this.layer.dataSource.options as any).fieldNameGeometry
          );
        }
        this.ogcFilterService.filterByOgc(
          this.datasource as WMSDataSource,
          rebuildFilter
        );
        this.datasource.options.ogcFilters.filtered =
          activeFilters.length === 0 ? false : true;
      }

      this.lastRunOgcFilter = JSON.parse(JSON.stringify(activeFilters));
    } else {
      // identical filter. Nothing triggered
    }
  }

  public setVisible() {
    this.layer.visible = true;
  }

  public isAdvancedOgcFilters(): boolean {
    return this.datasource.options.ogcFilters.advancedOgcFilters;
  }

  public addFilterDisabled(): boolean {
    return (
      !this.datasource.options.sourceFields ||
      this.datasource.options.sourceFields.length === 0
    );
  }

  private changeOgcFiltersAdvancedOgcFilters(value: boolean) {
    this.datasource.options.ogcFilters.advancedOgcFilters = value;
  }

  changeOgcFilterType(isAdvancedOgcFilters) {
    this.changeOgcFiltersAdvancedOgcFilters(isAdvancedOgcFilters.checked);
    if (isAdvancedOgcFilters.checked) {
      this.refreshFilters(true);
    }
  }

  private toggleLegend(collapsed: boolean) {
    this.layer.legendCollapsed = collapsed;
    this.showLegend$.next(!collapsed);
  }

  toggleLegendOnClick() {
    if (!this.filtersCollapsed) {
      this.toggleLegend(this.showLegend$.value);
    }
  }

  toggleFiltersCollapsed() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }
}

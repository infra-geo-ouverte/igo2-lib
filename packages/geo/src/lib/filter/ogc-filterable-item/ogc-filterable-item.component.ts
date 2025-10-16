import { AsyncPipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CollapseDirective } from '@igo2/common/collapsible';
import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, Subscription } from 'rxjs';

import {
  WFSDataSourceOptions,
  WFSDataSourceOptionsParams
} from '../../datasource/shared/datasources/wfs-datasource.interface';
import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { OgcFilterOperator } from '../../filter/shared/ogc-filter.enum';
import { Layer } from '../../layer';
import { LayerLegendComponent } from '../../layer/layer-legend/layer-legend.component';
import { MapBase } from '../../map';
import { OgcFilterableFormComponent } from '../ogc-filterable-form/ogc-filterable-form.component';
import { OgcFilterWriter } from '../shared/ogc-filter';
import {
  OgcFilterableDataSource,
  OgcFiltersOptions,
  OgcInterfaceFilterOptions
} from '../shared/ogc-filter.interface';
import { OGCFilterService } from '../shared/ogc-filter.service';

@Component({
  selector: 'igo-ogc-filterable-item',
  templateUrl: './ogc-filterable-item.component.html',
  styleUrls: ['./ogc-filterable-item.component.scss'],
  imports: [
    NgClass,
    MatListModule,
    NgIf,
    MatIconModule,
    CollapseDirective,
    NgStyle,
    MatTooltipModule,
    MatButtonModule,
    LayerLegendComponent,
    OgcFilterableFormComponent,
    MatDividerModule,
    MatCheckboxModule,
    FormsModule,
    AsyncPipe,
    IgoLanguageModule
  ],
  providers: [OGCFilterService]
})
export class OgcFilterableItemComponent implements OnInit, OnDestroy {
  public color = 'primary';
  private lastRunOgcFilter;
  private defaultLogicalParent = OgcFilterOperator.And;
  public hasActiveSpatialFilter = false;
  public filtersAreEditable = true;
  public filtersCollapsed = true;
  public hasSelector = false;
  showLegend$ = new BehaviorSubject<boolean>(false);
  inResolutionRange$ = new BehaviorSubject<boolean>(true);
  private resolution$$: Subscription;
  private ogcFilterWriter;

  @Input() layer: Layer;

  @Input() map: MapBase;

  @Input() header = true;

  get refreshFunc() {
    return this.refreshFilters.bind(this);
  }

  get datasource(): OgcFilterableDataSource {
    return this.layer.dataSource as OgcFilterableDataSource;
  }

  constructor(private ogcFilterService: OGCFilterService) {
    this.ogcFilterWriter = new OgcFilterWriter();
  }

  ngOnInit() {
    if (this.layer.visible) {
      this.filtersCollapsed = false;
    }

    const ogcFilters = this.datasource.options.ogcFilters;
    if (
      (ogcFilters.pushButtons && ogcFilters.pushButtons.bundles.length > 0) ||
      (ogcFilters.checkboxes && ogcFilters.checkboxes.bundles.length > 0) ||
      (ogcFilters.radioButtons && ogcFilters.radioButtons.bundles.length > 0) ||
      (ogcFilters.select && ogcFilters.select.bundles.length > 0) ||
      (ogcFilters.autocomplete && ogcFilters.autocomplete.bundles.length > 0)
    ) {
      if (ogcFilters.advancedOgcFilters === undefined) {
        ogcFilters.advancedOgcFilters = false;
      }
      this.hasSelector = true;
    }

    switch (this.datasource.options.type) {
      case 'wms':
        this.ogcFilterService.setOgcWMSFiltersOptions(this.datasource);
        break;
      case 'wfs':
        this.ogcFilterService.setOgcWFSFiltersOptions(
          this.datasource.options as WFSDataSourceOptions
        );
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
          ogcFilters.interfaceOgcFilters.filter((f) => f.wkt_geometry).length >=
          1
        ) {
          this.hasActiveSpatialFilter = true;
        }
      }

      this.filtersAreEditable = ogcFilters.editable
        ? ogcFilters.editable
        : false;
    }

    const resolution$ = this.layer.map.viewController.resolution$;
    this.resolution$$ = resolution$.subscribe(() => {
      this.inResolutionRange$.next(this.layer.isInResolutionsRange);
    });
  }

  ngOnDestroy(): void {
    this.resolution$$.unsubscribe();
  }

  addFilterToSequence() {
    this.filtersCollapsed = false;
    const interfaceOgcFilters: OgcInterfaceFilterOptions[] =
      this.datasource.options.ogcFilters.interfaceOgcFilters;
    const arr = interfaceOgcFilters || [];
    const lastLevel = arr.length === 0 ? 0 : arr[arr.length - 1].level;
    let firstFieldName = '';
    const includedFields = this.datasource.options.sourceFields.filter(
      (f) => !f.excludeFromOgcFilters
    );
    if (includedFields.length > 0) {
      firstFieldName =
        includedFields[0].name === undefined ? '' : includedFields[0].name;
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
    const allowedOperators = this.ogcFilterWriter.computeAllowedOperators(
      this.datasource.options.sourceFields,
      firstFieldName,
      this.datasource.options.ogcFilters.allowedOperatorsType
    );
    const firstOperatorName = Object.keys(allowedOperators)[0];

    arr.push(
      this.ogcFilterWriter.addInterfaceFilter(
        {
          propertyName: firstFieldName,
          operator: firstOperatorName,
          active: true,
          igoSpatialSelector: 'fixedExtent',
          srsName: this.map.projection
        } as OgcInterfaceFilterOptions,
        fieldNameGeometry,
        lastLevel,
        this.defaultLogicalParent
      )
    );
    this.datasource.options.ogcFilters.interfaceOgcFilters = arr;
  }

  refreshFilters(force?: boolean) {
    if (force === true) {
      this.lastRunOgcFilter = undefined;
    }
    const ogcFilters: OgcFiltersOptions = this.datasource.options.ogcFilters;
    const activeFilters = ogcFilters.interfaceOgcFilters
      ? ogcFilters.interfaceOgcFilters.filter((f) => f.active === true)
      : [];
    if (activeFilters.length === 0) {
      ogcFilters.filters = undefined;
      ogcFilters.filtered = false;
    }
    if (activeFilters.length > 1) {
      activeFilters[0].parentLogical = activeFilters[1].parentLogical;
    }
    if (
      activeFilters.filter(
        (af) => ['Contains', 'Intersects', 'Within'].indexOf(af.operator) !== -1
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
        ogcLayer.filters =
          this.ogcFilterWriter.rebuiltIgoOgcFilterObjectFromSequence(
            activeFilters
          );
        this.layer.dataSource.ol.refresh();
      } else if (
        this.layer.dataSource.options.type === 'wms' &&
        ogcFilters.enabled
      ) {
        let rebuildFilter = '';
        if (activeFilters.length >= 1) {
          const ogcDataSource: any = this.layer.dataSource;
          const ogcLayer: OgcFiltersOptions = ogcDataSource.options.ogcFilters;
          ogcLayer.filters =
            this.ogcFilterWriter.rebuiltIgoOgcFilterObjectFromSequence(
              activeFilters
            );
          rebuildFilter = this.ogcFilterWriter.buildFilter(
            ogcLayer.filters,
            undefined,
            undefined,
            (this.layer.dataSource.options as any).fieldNameGeometry,
            ogcDataSource.options
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
    (this.layer.dataSource as OgcFilterableDataSource).setOgcFilters(
      ogcFilters,
      true
    );
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

  toggleLegendOnClick() {
    if (!this.filtersCollapsed) {
      this.showLegend$.next(!this.showLegend$.value);
    }
  }

  toggleFiltersCollapsed() {
    this.filtersCollapsed = !this.filtersCollapsed;
  }
}

import { AsyncPipe, KeyValuePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject, input } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import {
  FloatLabelType,
  MatFormFieldModule
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { BehaviorSubject, Observable, of } from 'rxjs';

import { SourceFieldsOptionsParams } from '../../datasource/shared/datasources/datasource.interface';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import { OgcFilterOperator } from '../../filter/shared/ogc-filter.enum';
import {
  OgcFilterableDataSource,
  OgcFiltersOptions
} from '../../filter/shared/ogc-filter.interface';
import { MapBase } from '../../map';
import { WktService } from '../../wkt/shared/wkt.service';
import { OgcFilterTimeComponent } from '../ogc-filter-time/ogc-filter-time.component';

@Component({
  selector: 'igo-ogc-filter-form',
  templateUrl: './ogc-filter-form.component.html',
  styleUrls: ['./ogc-filter-form.component.scss'],
  imports: [
    MatCheckboxModule,
    MatTooltipModule,
    MatFormFieldModule,
    NgClass,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    OgcFilterTimeComponent,
    AsyncPipe,
    KeyValuePipe,
    IgoLanguageModule
  ]
})
export class OgcFilterFormComponent implements OnInit {
  private wktService = inject(WktService);

  ogcFilterOperator = OgcFilterOperator;
  filteredValues$: Observable<string[]>;
  filteredFields$: Observable<SourceFieldsOptionsParams[]>;
  public allOgcFilterOperators;
  public ogcFilterOperators$ = new BehaviorSubject<Record<string, any>>(
    undefined
  );
  public igoSpatialSelectors;
  public value = '';
  public inputOperator;
  public selectedField$ = new BehaviorSubject<SourceFieldsOptionsParams>(
    undefined
  );
  public fields$ = new BehaviorSubject<SourceFieldsOptionsParams[]>([]);
  public color = 'primary';
  public disabled;
  public currentFilterIsSpatial$ = new BehaviorSubject<boolean>(false);
  public defaultStepMillisecond = 6000;
  public inputClearable: string;

  readonly refreshFilters = input<() => void>(undefined);

  readonly datasource = input<OgcFilterableDataSource>(undefined);

  readonly map = input<MapBase>(undefined);

  readonly currentFilter = input<any>(undefined);

  set snrc(value: any) {
    const checkSNRC50k = /^\d{2}[a-l][0,1][0-9]$/gi;
    const checkSNRC250k = /^\d{2}[a-p]$/gi;
    const checkSNRC1m = /^\d{2}$/gi;
    if (
      checkSNRC1m.test(value) ||
      checkSNRC250k.test(value) ||
      checkSNRC50k.test(value)
    ) {
      this._snrc = value;
      this.currentFilter().igoSNRC = value;
    }
  }

  get snrc(): any {
    return this._snrc;
  }

  private _snrc = '';

  readonly floatLabel = input<FloatLabelType>(undefined);

  get activeFilters() {
    return this.datasource().options.ogcFilters.interfaceOgcFilters.filter(
      (f) => f.active === true
    );
  }

  get allowedOperators() {
    return new OgcFilterWriter().computeAllowedOperators(
      this.fields$.value,
      this.currentFilter().propertyName,
      this.datasource().options.ogcFilters.allowedOperatorsType
    );
  }

  constructor() {
    // TODO: Filter permitted operator based on wfscapabilities
    // Need to work on regex on XML capabilities because
    // comaparison operator's name varies between WFS servers...
    // Ex: IsNull vs PropertyIsNull vs IsNil ...
    this.allOgcFilterOperators = new OgcFilterWriter().operators;
    this.ogcFilterOperators$.next(this.allOgcFilterOperators);
    this.igoSpatialSelectors = [
      {
        type: 'fixedExtent'
      },
      {
        type: 'snrc'
      }
    ];
    // TODO: selectFeature & drawFeature
  }

  ngOnInit() {
    const datasource = this.datasource();
    if (datasource.options.sourceFields) {
      const sFields = datasource.options.sourceFields.filter(
        (sf) =>
          sf.excludeFromOgcFilters === undefined || !sf.excludeFromOgcFilters
      );
      sFields.map((sfs) => {
        if (sfs.values) {
          sfs.values.sort();
        }
      });
      this.fields$.next(sFields);
    }

    this.updateFieldsList();
    this.selectedField$.next(
      this.fields$.value.find(
        (f) => f.name === this.currentFilter().propertyName
      )
    );
    this.updateValuesList();
    this.selectedField$.subscribe(() => {
      this.ogcFilterOperators$.next(this.allowedOperators);
      const cf = this.currentFilter();
      if (
        cf &&
        Object.keys(this.allowedOperators).indexOf(cf.operator) === -1
      ) {
        cf.operator = Object.keys(this.allowedOperators)[0];
      }
      this.updateValuesList();
    });
    this.currentFilterIsSpatial();
  }

  updateFieldsList(value?: string) {
    this.filteredFields$ =
      value && value.length > 0 ? of(this._filterFields(value)) : this.fields$;
    if (this.fields$.value.find((f) => f.name === value)) {
      this.changeField(value);
    }
  }

  updateValuesList(value?: string, pos?: number) {
    this.filteredValues$ =
      value && value.length > 0
        ? of(this._filterValues(value))
        : this.selectedField$.value
          ? of(this.selectedField$.value.values)
          : of([]);
    if (value && value.length >= 1) {
      this.changeProperty(value, pos);
    }
  }

  private _filterFields(value: string): SourceFieldsOptionsParams[] {
    const keywordRegex = new RegExp(
      value.normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
      'gi'
    );
    return this.fields$.value.filter((val) =>
      keywordRegex.test(
        val.alias.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
    );
  }

  private _filterValues(value: string): string[] {
    const keywordRegex = new RegExp(
      value
        .replace(/[.*+?^${}()|[\]\\]/g, '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''),
      'gi'
    );

    return this.selectedField$.value?.values?.filter(
      (val) =>
        val &&
        keywordRegex.test(
          val
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
        )
    );
  }

  clearSelectedField() {
    this.currentFilter().propertyName = '';
    this.selectedField$.next(undefined);
    this.clearProperty();
  }

  isClearable(pos?: number) {
    const detectedProperty = this.detectProperty(pos);
    if (detectedProperty) {
      return this.currentFilter()[detectedProperty];
    }
  }
  clearProperty(pos?: number) {
    // this.autoCompleteInputValues.closePanel();
    const detectedProperty = this.detectProperty(pos);
    if (detectedProperty) {
      return (this.currentFilter()[detectedProperty] = '');
    }
  }

  toggleFilterState(event) {
    this.datasource().options.ogcFilters.interfaceOgcFilters.find(
      (f) => f.filterid === this.currentFilter().filterid
    ).active = event.checked;
    this.refreshFilters()();
  }

  deleteFilter() {
    const ogcFilters: OgcFiltersOptions = this.datasource().options.ogcFilters;
    ogcFilters.interfaceOgcFilters = ogcFilters.interfaceOgcFilters.filter(
      (f) => f.filterid !== this.currentFilter().filterid
    );
    this.refreshFilters()();
  }

  changeLogical(logical: string) {
    this.currentFilter().parentLogical = logical;
    this.refreshFilters()();
  }

  changeOperator(operator: string) {
    const cf = this.currentFilter();
    cf.operator = operator;
    this.currentFilterIsSpatial();

    if (
      this.currentFilterIsSpatial$.value &&
      (!cf.wkt_geometry || cf.wkt_geometry.length === 0)
    ) {
      this.changeSpatialSelector(cf.igoSpatialSelector);
    } else {
      this.refreshFilters()();
    }
  }

  clearSNRC() {
    const cf = this.currentFilter();
    cf.igoSNRC = '';
    this.refreshFilters()();
  }

  changeField(field: string) {
    this.currentFilter().propertyName = field;
    this.selectedField$.next(
      this.fields$.value.find(
        (f) => f.name === this.currentFilter().propertyName
      )
    );
    this.refreshFilters()();
  }

  // Issue with mapserver 7.2 and Postgis layers. Fixed in 7.4
  // Due to this issue, the checkbox is hide.
  changeCaseSensitive(matchCase) {
    this.currentFilter().matchCase = matchCase.checked;
    this.refreshFilters()();
  }

  changeProperty(value: any, pos?: number, refreshFilter = true) {
    const detectedProperty = this.detectProperty(pos);
    if (detectedProperty) {
      this.datasource().options.ogcFilters.interfaceOgcFilters.find(
        (f) => f.filterid === this.currentFilter().filterid
      )[detectedProperty] = value;

      if (refreshFilter) {
        this.refreshFilters()();
      }
    }
  }

  changeNumericProperty(value, pos: number) {
    this.changeProperty(parseFloat(value), pos);
  }

  changeSpatialSelector(value: any) {
    this.currentFilter().igoSpatialSelector = value;

    if (value === 'fixedExtent') {
      this.changeMapExtentGeometry(false);
    }
    this.currentFilterIsSpatial();
    this.refreshFilters()();
  }

  changeSNRC(value: any) {
    this.snrc = value;
    this.changeSNRCGeometry();
  }

  changeSNRCGeometry() {
    const interfaceOgcFilter =
      this.datasource().options.ogcFilters.interfaceOgcFilters.find(
        (f) => f.filterid === this.currentFilter().filterid
      );
    if (!interfaceOgcFilter) {
      return;
    }

    const currentFilter = this.currentFilter();
    if (this.snrc && currentFilter.igoSpatialSelector === 'snrc') {
      currentFilter.wkt_geometry = this.wktService.snrcToWkt(
        this.snrc,
        this.map().projection
      ).wktPoly;
    }
    this.refreshFilters()();
  }

  changeMapExtentGeometry(refresh = true) {
    const interfaceOgcFilter =
      this.datasource().options.ogcFilters.interfaceOgcFilters.find(
        (f) => f.filterid === this.currentFilter().filterid
      );
    if (!interfaceOgcFilter) {
      return;
    }

    const currentFilter = this.currentFilter();
    if (currentFilter.igoSpatialSelector === 'fixedExtent') {
      currentFilter.wkt_geometry = this.wktService.extentToWkt(
        this.map().projection,
        this.map().viewController.getExtent(),
        this.map().projection
      ).wktPoly;
    }
    if (refresh) {
      this.refreshFilters()();
    }
  }

  detectProperty(pos?: number): string {
    switch (this.currentFilter().operator) {
      case OgcFilterOperator.PropertyIsNotEqualTo:
      case OgcFilterOperator.PropertyIsEqualTo:
      case OgcFilterOperator.PropertyIsGreaterThan:
      case OgcFilterOperator.PropertyIsGreaterThanOrEqualTo:
      case OgcFilterOperator.PropertyIsLessThan:
      case OgcFilterOperator.PropertyIsLessThanOrEqualTo:
        return 'expression';
      case OgcFilterOperator.PropertyIsLike:
        return 'pattern';
      case OgcFilterOperator.PropertyIsBetween:
        return pos && pos === 1
          ? 'lowerBoundary'
          : pos && pos === 2
            ? 'upperBoundary'
            : undefined;
      case OgcFilterOperator.During:
        return pos && pos === 1
          ? 'begin'
          : pos && pos === 2
            ? 'end'
            : undefined;
      default:
        return;
    }
  }

  private currentFilterIsSpatial() {
    let isSpatial = false;
    const currentFilter = this.currentFilter();
    if (currentFilter) {
      isSpatial =
        [
          OgcFilterOperator.Contains,
          OgcFilterOperator.Intersects,
          OgcFilterOperator.Within
        ].indexOf(currentFilter.operator) !== -1;
    }
    this.currentFilterIsSpatial$.next(isSpatial);
  }

  isTemporalOperator() {
    return (
      this.currentFilter().operator.toLowerCase() ===
      this.ogcFilterOperator.During.toLowerCase()
    );
  }
}

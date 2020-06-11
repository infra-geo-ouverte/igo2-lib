import {
  Component,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  OgcInterfaceFilterOptions,
  OgcFilterableDataSource,
  OgcFiltersOptions
} from '../../filter/shared/ogc-filter.interface';
import { OgcFilterWriter } from '../../filter/shared/ogc-filter';
import { WktService } from '../../wkt/shared/wkt.service';
import { IgoMap } from '../../map';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { SourceFieldsOptionsParams } from '../../datasource/shared/datasources/datasource.interface';
import { OgcFilterOperator } from '../../filter/shared/ogc-filter.enum';
import { FloatLabelType, MatSlideToggle, MatDatepicker } from '@angular/material';
import * as moment_ from 'moment';
const moment = moment_;
import { TimeFilterType, TimeFilterStyle } from '../shared/time-filter.enum';
import { MatDatetimepickerFilterType } from '@mat-datetimepicker/core';

@Component({
  selector: 'igo-ogc-filter-form',
  templateUrl: './ogc-filter-form.component.html',
  styleUrls: ['./ogc-filter-form.component.scss']
})
export class OgcFilterFormComponent implements OnInit {

  ogcFilterOperator = OgcFilterOperator;
  filteredValues$: Observable<string[]>;
  filteredFields$: Observable<SourceFieldsOptionsParams[]>;
  public allOgcFilterOperators;
  public ogcFilterOperators$ = new BehaviorSubject<{ [key: string]: any }>(undefined);
  public igoSpatialSelectors;
  public value = '';
  public inputOperator;
  public selectedField$ = new BehaviorSubject<SourceFieldsOptionsParams>(undefined);
  public fields$ = new BehaviorSubject<SourceFieldsOptionsParams[]>([]);
  public color = 'primary';
  public disabled;
  public currentFilterIsSpatial$ = new BehaviorSubject<boolean>(false);
  public defaultStepMillisecond = 6000;
  public inputClearable: string;

  @Input() refreshFilters: () => void;

  @Input() datasource: OgcFilterableDataSource;

  @Input() map: IgoMap;

  @Input() currentFilter: any;

  set snrc(value: any) {
    const checkSNRC50k = /^\d{2}[a-l][0,1][0-9]$/gi;
    const checkSNRC250k = /^\d{2}[a-p]$/gi;
    const checkSNRC1m = /^\d{2}$/gi;
    if (checkSNRC1m.test(value) || checkSNRC250k.test(value) || checkSNRC50k.test(value)) {
      this._snrc = value;
      this.currentFilter.igoSNRC = value;
    }
  }

  get snrc(): any {
    return this._snrc;
  }

  private _snrc = '';

  @Input() floatLabel: FloatLabelType = 'never';

  get activeFilters() {
    return this.datasource.options.ogcFilters.interfaceOgcFilters.filter(
      f => f.active === true
    );
  }

  get allowedOperators() {
    return new OgcFilterWriter().computeAllowedOperators(
      this.fields$.value,
      this.currentFilter.propertyName,
      this.datasource.options.ogcFilters.allowedOperatorsType);
  }

  get step(): string {
    return this.datasource.options.stepDate ? this.datasource.options.stepDate : this.currentFilter.step;
  }

  get stepMilliseconds(): number {
    const step = moment.duration(this.step).asMilliseconds();
    return step === 0 ? this.defaultStepMillisecond : step;
  }

  constructor(
    private wktService: WktService
  ) {
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
    const sFields = this.datasource.options.sourceFields
      .filter(sf => (sf.excludeFromOgcFilters === undefined || !sf.excludeFromOgcFilters));
    sFields.map(sfs => {
      if (sfs.values) {
        sfs.values.sort();
      }
    });
    this.fields$.next(sFields);
    this.updateFieldsList();
    this.selectedField$.next(this.fields$.value.find(f => f.name === this.currentFilter.propertyName));
    this.updateValuesList();
    this.selectedField$.subscribe((f) => {
      this.ogcFilterOperators$.next(this.allowedOperators);
      if (Object.keys(this.allowedOperators).indexOf(this.currentFilter.operator) === -1) {
        this.currentFilter.operator = Object.keys(this.allowedOperators)[0];
        this.currentFilter.operator = Object.keys(this.allowedOperators)[0];
      }
      this.updateValuesList();
    });
    this.currentFilterIsSpatial();

  }

  updateFieldsList(value?: string) {
    this.filteredFields$ = value && value.length > 0 ? of(this._filterFields(value)) : this.fields$;
  }

  updateValuesList(value?: string, pos?: number) {
    this.filteredValues$ =
    value && value.length > 0 ? of(this._filterValues(value)) : this.selectedField$.value ? of(this.selectedField$.value.values) : of([]);
    if (value && value.length >= 2) {
      this.changeProperty(value, pos);
    }
  }

  private _filterFields(value: string): SourceFieldsOptionsParams[] {
    const keywordRegex = new RegExp(value.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), 'gi');
    return this.fields$.value.filter(val => keywordRegex.test(val.alias.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
  }

  private _filterValues(value: string): string[] {
    const keywordRegex = new RegExp(value.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, ''), 'gi');
    return this.selectedField$.value.values
      .filter(val => keywordRegex.test(val.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
  }

  clearSelectedField() {
    this.currentFilter.propertyName = '';
    this.selectedField$.next(undefined);
    this.clearProperty();
  }

  isClearable(pos?: number) {
    const detectedProperty = this.detectProperty(pos);
    if (detectedProperty) {
      return this.currentFilter[detectedProperty];
    }
  }
  clearProperty(pos?: number) {
    // this.autoCompleteInputValues.closePanel();
    const detectedProperty = this.detectProperty(pos);
    if (detectedProperty) {
      return this.currentFilter[detectedProperty] = '';
    }
  }

  toggleFilterState(event) {
    this.datasource.options.ogcFilters.interfaceOgcFilters
      .find(f => f.filterid === this.currentFilter.filterid).active = event.checked;
    this.refreshFilters();
  }

  deleteFilter() {
    const ogcFilters: OgcFiltersOptions = this.datasource.options.ogcFilters;
    ogcFilters.interfaceOgcFilters = ogcFilters.interfaceOgcFilters.filter(
      f => f.filterid !== this.currentFilter.filterid
    );
    this.refreshFilters();
  }

  changeLogical(logical: string) {
    this.currentFilter.parentLogical = logical;
    this.refreshFilters();
  }

  changeOperator(operator: string) {
    this.currentFilter.operator = operator;
    this.currentFilterIsSpatial();

    if (this.currentFilterIsSpatial$.value && this.currentFilter.wkt_geometry.length === 0 ) {
      this.changeSpatialSelector(this.currentFilter.igoSpatialSelector);
    } else {
      this.refreshFilters();
    }
  }

  changeTemporalProperty(value, pos ) {
    let valueTmp = new Date(value);
    if (pos === 2 && this.calendarType() === 'date') {
      /* Above month: see yearSelected or monthSelected */
      if ( this.calendarType() !== 'datetime'  ) {
        valueTmp = moment(valueTmp).endOf('day').toDate();
      }
    }
    this.changeProperty(valueTmp.toISOString(), pos);
    this.refreshFilters();
  }

  changeField(field: string) {
    this.currentFilter.propertyName = field;
    this.selectedField$.next(this.fields$.value.find(f => f.name === this.currentFilter.propertyName));
    this.refreshFilters();
  }

  // Issue with mapserver 7.2 and Postgis layers. Fixed in 7.4
  // Due to this issue, the checkbox is hide.
  changeCaseSensitive(matchCase) {
    this.currentFilter.matchCase = matchCase.checked;
    this.refreshFilters();
  }

  changeProperty(value: any, pos?: number) {

    const detectedProperty = this.detectProperty(pos);
    if (detectedProperty) {
      this.datasource.options.ogcFilters.interfaceOgcFilters
      .find(f => f.filterid === this.currentFilter.filterid)[detectedProperty] = value;
      this.refreshFilters();
    }

  }

  changeNumericProperty(value, pos: number) {
    this.changeProperty(parseFloat(value), pos);
  }

  changeSpatialSelector(value: any) {
    this.currentFilter.igoSpatialSelector = value;

    if (value === 'fixedExtent') {
      this.changeMapExtentGeometry(false);
    }
    this.currentFilterIsSpatial();
    this.refreshFilters();
  }

  changeSNRC(value: any) {
    this.snrc = value;
    this.changeSNRCGeometry();
  }

  changeSNRCGeometry() {
    const interfaceOgcFilter = this.datasource.options.ogcFilters.interfaceOgcFilters.find(f => f.filterid === this.currentFilter.filterid);
    if (!interfaceOgcFilter) { return; }

    if (this.snrc && this.currentFilter.igoSpatialSelector === 'snrc') {
      this.currentFilter.wkt_geometry = this.wktService.snrcToWkt(this.snrc, this.map.projection).wktPoly;
    }
    this.refreshFilters();
  }

  changeMapExtentGeometry(refresh: boolean = true) {
    const interfaceOgcFilter = this.datasource.options.ogcFilters.interfaceOgcFilters.find(f => f.filterid === this.currentFilter.filterid);
    if (!interfaceOgcFilter) { return; }

    if (this.currentFilter.igoSpatialSelector === 'fixedExtent') {
      this.currentFilter.wkt_geometry =
      this.wktService.extentToWkt( this.map.projection, this.map.viewController.getExtent(), this.map.projection).wktPoly;
    }
    if (refresh) {
      this.refreshFilters();
    }
  }

  detectProperty(pos?: number) {
    switch (this.currentFilter.operator) {
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
        return pos && pos === 1 ? 'lowerBoundary' : pos && pos === 2 ? 'upperBoundary' : undefined;
      case OgcFilterOperator.During:
        return pos && pos === 1 ? 'begin' : pos && pos === 2 ? 'end' : undefined;
      default:
        return;
    }
  }

  private currentFilterIsSpatial() {
    let isSpatial = false;
    if (this.currentFilter) {
      isSpatial = [OgcFilterOperator.Contains, OgcFilterOperator.Intersects, OgcFilterOperator.Within]
                    .indexOf(this.currentFilter.operator) !== -1;
    }
    this.currentFilterIsSpatial$.next(isSpatial);
  }

  handleDate(value) {
    if ( !value || value === '') {
      return undefined;
    }
    return new Date(value);
  }

  yearSelected(year, datePicker?: any, property?: string) {
    if (this.stepIsYearDuration()) {
        datePicker.close();
        if (property === 'end') {
          year = moment(year).endOf('year').toDate();
        }
        this.changeTemporalProperty(year, ( property === 'begin' ? 1 : 2));
    }
  }

  monthSelected(month, datePicker?: any, property?: string) {
    if (this.stepIsMonthDuration()) {
      datePicker.close();
      if (property === 'end') {
        month = moment(month).endOf('month').toDate();
      }
      this.changeTemporalProperty( month, ( property === 'begin' ? 1 : 2));
    }
  }

  calendarView() {
    const test = this.stepMilliseconds;
    const diff = Math.abs(new Date(this.currentFilter.end).getTime() - new Date(this.currentFilter.begin).getTime());
    if ( this.stepIsYearDuration() ) {
      return 'multi-year';
    } else if (this.stepIsMonthDuration()) {
      return 'year';
    } else if (test < 86400000 && diff < 86400000) {
      return 'clock';
    } else {
      return 'month';
    }
  }

  calendarType() {
    if (this.stepMilliseconds < 86400000 ) {
      return 'datetime';
    }
    return 'date';
  }

  stepIsMonthDuration() {
    const month = moment.duration(this.step).asMonths();
    return month === 0 ? false : ( month % 1 ) === 0;
  }

  stepIsYearDuration() {
    const year = moment.duration(this.step).asYears();
    return year === 0 ? false : ( year % 1 ) === 0;
  }

  stepIsWeekDuration() {
    const week = moment.duration(this.step).asWeeks();
    return week === 0 ? false : ( week % 1 ) === 0;
  }

  stepIsDayDuration() {
    const day = moment.duration(this.step).asDays();
    return day === 0 ? false : ( day % 1 ) === 0;
  }

  dateFilter(type: string, date: string ): boolean {
    const dateValue = new Date(date);
    const diff = dateValue.getTime() - new Date(this.datasource.options.minDate).getTime();

    if (this.stepIsMonthDuration()) {
      const monthDiff = moment(dateValue).diff(moment(this.datasource.options.minDate), 'months', true);
      if ( type === 'end' ) {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const monthDiffPlus1 =  moment(dateValuePlus1).diff(moment(this.datasource.options.minDate), 'months', true);
        return (monthDiffPlus1 % moment.duration(this.step).asMonths()) === 0;
      } else if ( type === 'begin' ) {
        return (monthDiff % moment.duration(this.step).asMonths()) === 0;
      }
    } else if (this.stepIsWeekDuration()) {
      const weekDiff = moment(dateValue).diff(moment(this.datasource.options.minDate), 'weeks', true);
      if ( type === 'end' ) {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const weekDiffPlus1 =  moment(dateValuePlus1).diff(moment(this.datasource.options.minDate), 'weeks', true);
        return (weekDiffPlus1 % moment.duration(this.step).asWeeks()) === 0;
      } else if ( type === 'begin' ) {
        return (weekDiff % moment.duration(this.step).asWeeks()) === 0;
      }
    } else if (this.stepIsDayDuration()) {
      const dayDiff = moment(dateValue).diff(moment(this.datasource.options.minDate), 'days', true);
      if ( type === 'end' ) {
        const dateValuePlus1 = moment(dateValue).add(1, 'd');
        const dayDiffPlus1 =  moment(dateValuePlus1).diff(moment(this.datasource.options.minDate), 'days', true);
        return (dayDiffPlus1 % moment.duration(this.step).asDays()) === 0;
      } else if ( type === 'begin' ) {
        return (dayDiff % moment.duration(this.step).asDays()) === 0;
      }
    }
    return diff % this.stepMilliseconds === 0;

  }

  isTemporalOperator() {
    return this.currentFilter.operator.toLowerCase() === this.ogcFilterOperator.During.toLowerCase();
  }

}

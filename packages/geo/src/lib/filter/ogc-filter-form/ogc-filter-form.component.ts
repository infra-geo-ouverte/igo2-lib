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
import { BehaviorSubject } from 'rxjs';
import { SourceFieldsOptionsParams } from '../../datasource/shared/datasources/datasource.interface';
import { OgcFilterOperatorType } from '../../filter/shared/ogc-filter.enum';
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
  public allOgcFilterOperators;
  public ogcFilterOperators$ = new BehaviorSubject<{ [key: string]: any }>(undefined);
  public igoSpatialSelectors;
  public value = '';
  public inputOperator;
  public fields$ = new BehaviorSubject<SourceFieldsOptionsParams[]>([]);
  public values: any[];
  public color = 'primary';
  public snrc = '';
  public disabled;
  public baseOverlayName = 'ogcFilterOverlay_';
  public currentFilter$ = new BehaviorSubject<any>(undefined);
  public defaultStepMillisecond = 6000;

  @Input() refreshFilters: () => void;

  @Input() datasource: OgcFilterableDataSource;

  @Input() map: IgoMap;

  @Input()
  set currentFilter(currentFilter: any) {
    this.currentFilter$.next(currentFilter);
  }
  get currentFilter(): any {
    return this.currentFilter$.value;
  }

  @Input() floatLabel: FloatLabelType = 'never';

  get activeFilters() {
    return this.datasource.options.ogcFilters.interfaceOgcFilters.filter(
      f => f.active === true
    );
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
    this.updateField();
  }

  updateField() {
    if (!this.datasource.options.sourceFields) {
      return;
    }
    const fields = this.datasource.options.sourceFields
      .filter(sf => (sf.excludeFromOgcFilters === undefined || !sf.excludeFromOgcFilters));
    fields.filter(f => f.name === this.currentFilter.propertyName)
      .forEach(element => {
        this.values = element.values !== undefined ? element.values.sort() : [];
      });

    this.fields$.next(fields);
    const allowedOperators = new OgcFilterWriter().computeAllowedOperators(
      fields,
      this.currentFilter.propertyName,
      this.datasource.options.ogcFilters.allowedOperatorsType);
    this.ogcFilterOperators$.next(allowedOperators);
    if (Object.keys(allowedOperators).indexOf(this.currentFilter$.value.operator) === -1) {
      this.currentFilter$.value.operator = Object.keys(allowedOperators)[0];
    }
    this.refreshFilters();
  }

  toggleFilterState(event, filter: OgcInterfaceFilterOptions, property) {
    this.updateField();
    if (event.checked) {
      this.datasource.options.ogcFilters.interfaceOgcFilters
        .filter(f => f.filterid === filter.filterid)
        .forEach(element => {
          element[property] = true;
        });
    } else {
      this.removeOverlayByID(filter.filterid);
      this.datasource.options.ogcFilters.interfaceOgcFilters
        .filter(f => f.filterid === filter.filterid)
        .forEach(element => {
          element[property] = false;
        });
    }
    this.refreshFilters();
  }

  deleteFilter(filter: OgcInterfaceFilterOptions) {
    const ogcFilters: OgcFiltersOptions = this.datasource.options.ogcFilters;
    ogcFilters.interfaceOgcFilters = ogcFilters.interfaceOgcFilters.filter(
      f => f.filterid !== filter.filterid
    );
    this.removeOverlayByID(filter.filterid);

    this.refreshFilters();
  }

  changeNumericProperty(filter: OgcInterfaceFilterOptions, property, value) {
    this.changeProperty(filter, property, parseFloat(value));
    this.refreshFilters();
  }

  changeTemporalProperty(filter: OgcInterfaceFilterOptions, property, value) {
    let valueTmp = new Date(value);
    if (property === 'end' && this.calendarType() === 'date') {
      /* Above month: see yearSelected or monthSelected */
      if ( this.calendarType() !== 'datetime'  ) {
        valueTmp = moment(valueTmp).endOf('day').toDate();
      }
    }
    this.changeProperty(filter, property, valueTmp.toISOString());
    this.refreshFilters();
  }

  private removeOverlayByID(id) {
    const overlayId = this.baseOverlayName + id;
    if (this.map.overlay.dataSource.ol.getFeatureById(overlayId)) {
      this.map.overlay.dataSource.ol.removeFeature(
        this.map.overlay.dataSource.ol.getFeatureById(overlayId)
      );
    }
  }

  changeOperator(filter) {
    if (this.ogcFilterOperators$.value[filter.operator].spatial === false) {
      this.removeOverlayByID(filter.filterid);
    }
    this.refreshFilters();
  }

  // Issue with mapserver 7.2 and Postgis layers. Fixed in 7.4
  // Due to this issue, the checkbox is hide.
  changeCaseSensitive(matchCase) {
    this.currentFilter.matchCase = matchCase.checked;
    this.refreshFilters();
  }

  changeProperty(filter: OgcInterfaceFilterOptions, property, value) {
    this.datasource.options.ogcFilters.interfaceOgcFilters
      .filter(f => f.filterid === filter.filterid)
      .forEach(element => {
        element[property] = value;
      });
    this.refreshFilters();
  }

  changeGeometry(filter, value?) {
    const checkSNRC50k = /\d{2,3}[a-l][0,1][0-9]/gi;
    const checkSNRC250k = /\d{2,3}[a-p]/gi;
    const checkSNRC1m = /\d{2,3}/gi;
    const mapProjection = this.map.projection;
    this.removeOverlayByID(filter.filterid);
    this.datasource.options.ogcFilters.interfaceOgcFilters
      .filter(f => f.filterid === filter.filterid)
      .forEach(element => {
        let wktPoly;
        if (filter.igoSpatialSelector === 'snrc') {
          if (value === '' && this.snrc !== '') {
            wktPoly = this.wktService.snrcToWkt(this.snrc, this.map.projection).wktPoly;
            element.wkt_geometry = wktPoly;
          } else if (
            value !== '' &&
            (checkSNRC1m.test(value) ||
              checkSNRC250k.test(value) ||
              checkSNRC50k.test(value))
          ) {
            wktPoly = this.wktService.snrcToWkt(value, this.map.projection).wktPoly;
            element.wkt_geometry = wktPoly;
          }
        } else if (filter.igoSpatialSelector === 'fixedExtent') {
          wktPoly = this.wktService.extentToWkt(
            mapProjection,
            this.map.viewController.getExtent(),
            mapProjection
          ).wktPoly;
          element.wkt_geometry = wktPoly;
        }
      });
    this.refreshFilters();
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
        this.changeTemporalProperty(this.currentFilter, property, year);
    }
  }

  monthSelected(month, datePicker?: any, property?: string) {
    if (this.stepIsMonthDuration()) {
      datePicker.close();
      if (property === 'end') {
        month = moment(month).endOf('month').toDate();
      }
      this.changeTemporalProperty(this.currentFilter, property, month);
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
}

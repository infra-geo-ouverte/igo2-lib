import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';
import { TileArcGISRestDataSource } from '../../datasource/shared/datasources/tilearcgisrest-datasource';

@Injectable()
export class TimeFilterService {
  constructor() {}

  filterByDate(
    datasource: WMSDataSource | TileArcGISRestDataSource,
    date: Date | [Date, Date]
  ) {
    let time;
    let newdateform;
    let newdateform_start;
    let newdateform_end;

    if (Array.isArray(date)) {
      const dates = [];
      if (date[0]) {
        newdateform_start = this.reformatDateTime(date[0]);
        dates.push(date[0]);
      }
      if (date[1]) {
        newdateform_end = this.reformatDateTime(date[1]);
        dates.push(date[1]);
      }
      if (dates.length === 2 && newdateform_start !== newdateform_end) {
        if (datasource instanceof TileArcGISRestDataSource) {
          time = newdateform_start + ',' + newdateform_end;
        } else {
          time = newdateform_start + '/' + newdateform_end;
        }
      }
      if (newdateform_start === newdateform_end) {
        time = newdateform_start;
      }
    } else if (date) {
      newdateform = this.reformatDateTime(date);
      time = newdateform;
    }

    const params = { time: time };
    datasource.ol.updateParams(params);
  }

  filterByYear(
    datasource: WMSDataSource | TileArcGISRestDataSource,
    year: string | [string, string]
  ) {
    let time;
    let newdateform_start;
    let newdateform_end;

    if (Array.isArray(year)) {
      const years = [];
      if (year[0]) {
        newdateform_start = year[0];
        years.push(year[0]);
      }
      if (year[1]) {
        newdateform_end = year[1];
        years.push(year[1]);
      }
      if (years.length === 2 && newdateform_start !== newdateform_end) {
        if (datasource instanceof TileArcGISRestDataSource) {
          time = newdateform_start + ',' + newdateform_end;
        } else {
          time = newdateform_start + '/' + newdateform_end;
        }
      }
      if (newdateform_start === newdateform_end) {
        time = newdateform_start;
      }
    } else if (year) {
      time = year;
    }

    const params = { time: time };
    datasource.ol.updateParams(params);
  }

  private reformatDateTime(value) {
    const year = value.getFullYear();
    let month = value.getMonth() + 1;
    let day = value.getUTCDate();
    let hour = value.getUTCHours();
    let minute = value.getUTCMinutes();

    if (Number(month) < 10) {
      month = '0' + month;
    }

    if (Number(day) < 10) {
      day = '0' + day;
    }

    if (Number(hour) < 10) {
      hour = '0' + hour;
    }

    if (Number(minute) < 10) {
      minute = '0' + minute;
    }

    return year + '-' + month + '-' + day + 'T' + hour + ':' + minute + ':00Z';
  }
}

import { Injectable } from '@angular/core';

import { TileArcGISRestDataSource } from '../../datasource/shared/datasources/tilearcgisrest-datasource';
import { WMSDataSource } from '../../datasource/shared/datasources/wms-datasource';

@Injectable()
export class TimeFilterService {
  filterByDate(
    datasource: WMSDataSource | TileArcGISRestDataSource,
    date: Date | [Date, Date]
  ) {
    let time;
    let newdateform;
    let newdateformStart;
    let newdateformEnd;

    if (Array.isArray(date)) {
      const dates = [];
      if (date[0]) {
        newdateformStart = this.reformatDateTime(date[0]);
        dates.push(date[0]);
      }
      if (date[1]) {
        newdateformEnd = this.reformatDateTime(date[1]);
        dates.push(date[1]);
      }
      if (dates.length === 2 && newdateformStart !== newdateformEnd) {
        if (datasource instanceof TileArcGISRestDataSource) {
          time = newdateformStart + ',' + newdateformEnd;
        } else {
          time = newdateformStart + '/' + newdateformEnd;
        }
      }
      if (newdateformStart === newdateformEnd) {
        time = newdateformStart;
      }
    } else if (date) {
      newdateform = this.reformatDateTime(date);
      time = newdateform;
    }

    const params = { TIME: time };
    datasource.ol.updateParams(params);
    if (datasource instanceof WMSDataSource) {
      const wmsDataSource = datasource as WMSDataSource;
      wmsDataSource.setTimeFilter(wmsDataSource.timeFilter, true);
    }
  }

  filterByYear(
    datasource: WMSDataSource | TileArcGISRestDataSource,
    year: string | [string, string]
  ) {
    let time;
    let newdateformStart;
    let newdateformEnd;

    if (Array.isArray(year)) {
      const years = [];
      if (year[0]) {
        newdateformStart = year[0];
        years.push(year[0]);
      }
      if (year[1]) {
        newdateformEnd = year[1];
        years.push(year[1]);
      }
      if (years.length === 2 && newdateformStart !== newdateformEnd) {
        if (datasource instanceof TileArcGISRestDataSource) {
          time = newdateformStart + ',' + newdateformEnd;
        } else {
          time = newdateformStart + '/' + newdateformEnd;
        }
      }
      if (newdateformStart === newdateformEnd) {
        time = newdateformStart;
      }
    } else {
      // to reset filter.
      time = year;
    }

    const params = { TIME: time };
    datasource.ol.updateParams(params);
    if (datasource instanceof WMSDataSource) {
      const wmsDataSource = datasource as WMSDataSource;
      wmsDataSource.setTimeFilter(wmsDataSource.timeFilter, true);
    }
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

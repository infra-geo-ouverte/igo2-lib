import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CapabilitiesService } from './capabilities.service';

import { DataSource,
         OSMDataSource, OSMDataSourceOptions,
         FeatureDataSource, FeatureDataSourceOptions,
         XYZDataSource, XYZDataSourceOptions,
         WFSDataSource, WFSDataSourceOptions,
         WMTSDataSource, WMTSDataSourceOptions,
         WMSDataSource, WMSDataSourceOptions } from './datasources';

export type AnyDataSourceOptions =
  OSMDataSourceOptions | FeatureDataSourceOptions | WFSDataSourceOptions |
  XYZDataSourceOptions | WMTSDataSourceOptions | WMSDataSourceOptions;


@Injectable()
export class DataSourceService {

  public datasources$ = new BehaviorSubject<DataSource[]>([]);

  constructor(private capabilitiesService: CapabilitiesService) { }

  createAsyncDataSource(options: AnyDataSourceOptions): Observable<DataSource> {
    let dataSource;
    switch (options.type) {
      case 'osm':
        dataSource = this.createOSMDataSource(options as OSMDataSourceOptions);
        break;
      case 'vector':
        dataSource = this.createFeatureDataSource(options as FeatureDataSourceOptions);
        break;
      case 'wfs':
        dataSource = this.createWFSDataSource(options as WFSDataSourceOptions);
        break;
      case 'wms':
        dataSource = this.createWMSDataSource(options as WMSDataSourceOptions);
        break;
      case 'wmts':
        dataSource = this.createWMTSDataSource(options as WMTSDataSourceOptions);
        break;
      case 'xyz':
        dataSource = this.createXYZDataSource(options as XYZDataSourceOptions);
        break;
      default:
        break;
    }

    this.datasources$.next(this.datasources$.value.concat([dataSource]));

    return dataSource;
  }

  private createOSMDataSource(
      options: OSMDataSourceOptions): Observable<OSMDataSource> {

    return new Observable(d => d.next(new OSMDataSource(options)));
  }

  private createFeatureDataSource(
      options: FeatureDataSourceOptions): Observable<FeatureDataSource> {

    return new Observable(d => d.next(new FeatureDataSource(options)));
  }

  private createWFSDataSource(
      options: WFSDataSourceOptions): Observable<WFSDataSource> {

    return new Observable(d => d.next(new WFSDataSource(options)));
  }

  private createWMSDataSource(
      options: WMSDataSourceOptions): Observable<WMSDataSource> {

    if (options.optionsFromCapabilities) {
      return this.capabilitiesService
        .getWMSOptions(options)
        .map((options_: WMSDataSourceOptions) => new WMSDataSource(options_));
    }

    return new Observable(d => d.next(new WMSDataSource(options)));
  }

  private createWMTSDataSource(
      options: WMTSDataSourceOptions): Observable<WMTSDataSource> {

    if (options.optionsFromCapabilities) {
      return this.capabilitiesService
        .getWMTSOptions(options)
        .map((options_: WMTSDataSourceOptions) => new WMTSDataSource(options_));
    }

    return new Observable(d => d.next(new WMTSDataSource(options)));
  }

  private createXYZDataSource(
      options: XYZDataSourceOptions): Observable<XYZDataSource> {

    return new Observable(d => d.next(new XYZDataSource(options)));
  }
}

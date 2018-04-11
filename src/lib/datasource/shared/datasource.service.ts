import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { CapabilitiesService } from './capabilities.service';

import { DataSource,
         OSMDataSource, OSMDataSourceContext,
         FeatureDataSource, FeatureDataSourceContext,
         XYZDataSource, XYZDataSourceContext,
         WFSDataSource, WFSDataSourceContext, WFSDataSourceService,
         WMTSDataSource, WMTSDataSourceContext,
         WMSDataSource, WMSDataSourceContext } from './datasources';

export type AnyDataSourceContext =
  OSMDataSourceContext | FeatureDataSourceContext | WFSDataSourceContext |
  XYZDataSourceContext | WMTSDataSourceContext | WMSDataSourceContext;


@Injectable()
export class DataSourceService {

  public datasources$ = new BehaviorSubject<DataSource[]>([]);

  constructor(
    private capabilitiesService: CapabilitiesService,
    private wfsDataSourceService: WFSDataSourceService
  ) { }

  createAsyncDataSource(context: AnyDataSourceContext): Observable<DataSource> {
    let dataSource;
    switch (context.type) {
      case 'osm':
        dataSource = this.createOSMDataSource(context as OSMDataSourceContext);
        break;
      case 'vector':
        dataSource = this.createFeatureDataSource(context as FeatureDataSourceContext);
        break;
      case 'wfs':
        dataSource = this.createWFSDataSource(context as WFSDataSourceContext);
        break;
      case 'wms':
        dataSource = this.createWMSDataSource(context as WMSDataSourceContext);
        break;
      case 'wmts':
        dataSource = this.createWMTSDataSource(context as WMTSDataSourceContext);
        break;
      case 'xyz':
        dataSource = this.createXYZDataSource(context as XYZDataSourceContext);
        break;
      default:
        break;
    }

    this.datasources$.next(this.datasources$.value.concat([dataSource]));

    return dataSource;
  }

  private createOSMDataSource(
      context: OSMDataSourceContext): Observable<OSMDataSource> {

    return new Observable(d => d.next(new OSMDataSource(context)));
  }

  private createFeatureDataSource(
      context: FeatureDataSourceContext): Observable<FeatureDataSource> {

    return new Observable(d => d.next(new FeatureDataSource(context)));
  }

  private createWFSDataSource(
      context: WFSDataSourceContext): Observable<WFSDataSource> {

    return new Observable(d => d.next(new WFSDataSource(context, this.wfsDataSourceService)));
  }

  private createWMSDataSource(
      context: WMSDataSourceContext): Observable<WMSDataSource> {

    if (context.optionsFromCapabilities) {
      return this.capabilitiesService
        .getWMSOptions(context)
        .map((options: WMSDataSourceContext) =>
        new WMSDataSource(options, this.wfsDataSourceService));
    }

    return new Observable(d => d.next(new WMSDataSource(context, this.wfsDataSourceService)));
  }

  private createWMTSDataSource(
      context: WMTSDataSourceContext): Observable<WMTSDataSource> {

    if (context.optionsFromCapabilities) {
      return this.capabilitiesService
        .getWMTSOptions(context)
        .map((options: WMTSDataSourceContext) => new WMTSDataSource(options));
    }

    return new Observable(d => d.next(new WMTSDataSource(context)));
  }

  private createXYZDataSource(
      context: XYZDataSourceContext): Observable<XYZDataSource> {

    return new Observable(d => d.next(new XYZDataSource(context)));
  }
}

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { CapabilitiesService } from './capabilities.service';

import {
  DataSource,
  OSMDataSource,
  OSMDataSourceOptions,
  FeatureDataSource,
  FeatureDataSourceOptions,
  XYZDataSource,
  XYZDataSourceOptions,
  WFSDataSource,
  WFSDataSourceOptions,
  WMTSDataSource,
  WMTSDataSourceOptions,
  WMSDataSource,
  WMSDataSourceOptions,
  CartoDataSource,
  CartoDataSourceOptions,
  ArcGISRestDataSource,
  ArcGISRestDataSourceOptions,
  TileArcGISRestDataSource,
  TileArcGISRestDataSourceOptions,
  AnyDataSourceOptions
} from './datasources';

@Injectable({
  providedIn: 'root'
})
export class DataSourceService {
  public datasources$ = new BehaviorSubject<DataSource[]>([]);

  constructor(private capabilitiesService: CapabilitiesService) {}

  createAsyncDataSource(context: AnyDataSourceOptions): Observable<DataSource> {
    let dataSource;
    switch (context.type) {
      case 'osm':
        dataSource = this.createOSMDataSource(context as OSMDataSourceOptions);
        break;
      case 'vector':
        dataSource = this.createFeatureDataSource(
          context as FeatureDataSourceOptions
        );
        break;
      case 'wfs':
        dataSource = this.createWFSDataSource(context as WFSDataSourceOptions);
        break;
      case 'wms':
        dataSource = this.createWMSDataSource(context as WMSDataSourceOptions);
        break;
      case 'wmts':
        dataSource = this.createWMTSDataSource(
          context as WMTSDataSourceOptions
        );
        break;
      case 'xyz':
        dataSource = this.createXYZDataSource(context as XYZDataSourceOptions);
        break;
      case 'carto':
        dataSource = this.createCartoDataSource(
          context as CartoDataSourceOptions
        );
        break;
      case 'arcgisrest':
        dataSource = this.createArcGISRestDataSource(
          context as ArcGISRestDataSourceOptions
        );
        break;
      case 'tilearcgisrest':
        dataSource = this.createTileArcGISRestDataSource(
          context as TileArcGISRestDataSourceOptions
        );
        break;
      default:
        break;
    }

    this.datasources$.next(this.datasources$.value.concat([dataSource]));

    return dataSource;
  }

  private createOSMDataSource(
    context: OSMDataSourceOptions
  ): Observable<OSMDataSource> {
    return new Observable(d => d.next(new OSMDataSource(context)));
  }

  private createFeatureDataSource(
    context: FeatureDataSourceOptions
  ): Observable<FeatureDataSource> {
    return new Observable(d => d.next(new FeatureDataSource(context)));
  }

  private createWFSDataSource(
    context: WFSDataSourceOptions
  ): Observable<WFSDataSource> {
    return new Observable(d => d.next(new WFSDataSource(context)));
  }

  private createWMSDataSource(
    context: WMSDataSourceOptions
  ): Observable<WMSDataSource> {
    if (context.optionsFromCapabilities) {
      return this.capabilitiesService
        .getWMSOptions(context)
        .pipe(
          map((options: WMSDataSourceOptions) => new WMSDataSource(options))
        );
    }

    return new Observable(d => d.next(new WMSDataSource(context)));
  }

  private createWMTSDataSource(
    context: WMTSDataSourceOptions
  ): Observable<WMTSDataSource> {
    if (context.optionsFromCapabilities) {
      return this.capabilitiesService
        .getWMTSOptions(context)
        .pipe(
          map((options: WMTSDataSourceOptions) => new WMTSDataSource(options))
        );
    }

    return new Observable(d => d.next(new WMTSDataSource(context)));
  }

  private createXYZDataSource(
    context: XYZDataSourceOptions
  ): Observable<XYZDataSource> {
    return new Observable(d => d.next(new XYZDataSource(context)));
  }

  private createCartoDataSource(
    context: CartoDataSourceOptions
  ): Observable<CartoDataSource> {
    return new Observable(d => d.next(new CartoDataSource(context)));
  }

  private createArcGISRestDataSource(
    context: ArcGISRestDataSourceOptions
  ): Observable<ArcGISRestDataSource> {
    return this.capabilitiesService
      .getArcgisOptions(context)
      .pipe(
        map(
          (options: ArcGISRestDataSourceOptions) =>
            new ArcGISRestDataSource(options)
        )
      );
  }

  private createTileArcGISRestDataSource(
    context: TileArcGISRestDataSourceOptions
  ): Observable<TileArcGISRestDataSource> {
    return this.capabilitiesService
      .getTileArcgisOptions(context)
      .pipe(
        map(
          (options: TileArcGISRestDataSourceOptions) =>
            new TileArcGISRestDataSource(options)
        )
      );
  }
}

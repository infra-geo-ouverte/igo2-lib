import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { CapabilitiesService } from './capabilities.service';
import { WFSService } from './datasources/wfs.service';
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
  WebSocketDataSource,
  AnyDataSourceOptions,
  MVTDataSource,
  MVTDataSourceOptions,
  ClusterDataSource,
  ClusterDataSourceOptions
} from './datasources';
import { ObjectUtils } from '@igo2/utils';

@Injectable({
  providedIn: 'root'
})
export class DataSourceService {
  public datasources$ = new BehaviorSubject<DataSource[]>([]);

  constructor(
    private capabilitiesService: CapabilitiesService,
    private wfsDataSourceService: WFSService
  ) {}

  createAsyncDataSource(context: AnyDataSourceOptions): Observable<DataSource> {
    if (!context.type) {
      console.error(context);
      throw new Error('Datasource needs a type');
    }
    let dataSource;
    switch (context.type.toLowerCase()) {
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
        const wmsContext = context as WMSDataSourceOptions;
        ObjectUtils.removeDuplicateCaseInsensitive(wmsContext.params);
        dataSource = this.createWMSDataSource(wmsContext);
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
      case 'websocket':
        dataSource = this.createWebSocketDataSource(
          context as FeatureDataSourceOptions
        );
        break;
      case 'mvt':
        dataSource = this.createMVTDataSource(context as MVTDataSourceOptions);
        break;
      case 'tilearcgisrest':
        dataSource = this.createTileArcGISRestDataSource(
          context as TileArcGISRestDataSourceOptions
        );
        break;
      case 'cluster':
        dataSource = this.createClusterDataSource(
          context as ClusterDataSourceOptions
        );
        break;
      default:
        console.error(context);
        throw new Error('Invalid datasource type');
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

  private createWebSocketDataSource(
    context: FeatureDataSourceOptions
  ): Observable<WebSocketDataSource> {
    return new Observable(d => d.next(new WebSocketDataSource(context)));
  }

  private createWFSDataSource(
    context: WFSDataSourceOptions
  ): Observable<WFSDataSource> {
    return new Observable(d =>
      d.next(new WFSDataSource(context, this.wfsDataSourceService))
    );
  }

  private createWMSDataSource(
    context: WMSDataSourceOptions
  ): Observable<WMSDataSource> {
    if (context.optionsFromCapabilities) {
      return this.capabilitiesService.getWMSOptions(context).pipe(
        map((options: WMSDataSourceOptions) => {
          return options
            ? new WMSDataSource(options, this.wfsDataSourceService)
            : undefined;
        })
      );
    }

    return new Observable(d =>
      d.next(new WMSDataSource(context, this.wfsDataSourceService))
    );
  }

  private createWMTSDataSource(
    context: WMTSDataSourceOptions
  ): Observable<WMTSDataSource> {
    if (context.optionsFromCapabilities) {
      return this.capabilitiesService.getWMTSOptions(context).pipe(
        map((options: WMTSDataSourceOptions) => {
          return options ? new WMTSDataSource(options) : undefined;
        })
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
    if (context.mapId) {
      return this.capabilitiesService
        .getCartoOptions(context)
        .pipe(
          map((options: CartoDataSourceOptions) => new CartoDataSource(options))
        );
    }
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

  private createMVTDataSource(
    context: MVTDataSourceOptions
  ): Observable<MVTDataSource> {
    return new Observable(d => d.next(new MVTDataSource(context)));
  }

  private createClusterDataSource(
    context: ClusterDataSourceOptions
  ): Observable<ClusterDataSource> {
    return new Observable(d => d.next(new ClusterDataSource(context)));
  }
}

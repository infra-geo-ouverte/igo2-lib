import { Injectable, Optional } from '@angular/core';

import { AuthInterceptor } from '@igo2/auth';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { ObjectUtils } from '@igo2/utils';

import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { OGCFilterService } from '../../filter/shared/ogc-filter.service';
import { CapabilitiesService } from './capabilities.service';
import {
  AnyDataSourceOptions,
  ArcGISRestDataSource,
  ArcGISRestDataSourceOptions,
  ArcGISRestImageDataSourceOptions,
  CartoDataSource,
  CartoDataSourceOptions,
  ClusterDataSource,
  ClusterDataSourceOptions,
  DataSource,
  FeatureDataSource,
  FeatureDataSourceOptions,
  ImageArcGISRestDataSource,
  MVTDataSource,
  MVTDataSourceOptions,
  OSMDataSource,
  OSMDataSourceOptions,
  TileArcGISRestDataSource,
  TileArcGISRestDataSourceOptions,
  TileDebugDataSource,
  TileDebugDataSourceOptions,
  WFSDataSource,
  WFSDataSourceOptions,
  WMSDataSource,
  WMSDataSourceOptions,
  WMSDataSourceOptionsParams,
  WMTSDataSource,
  WMTSDataSourceOptions,
  WebSocketDataSource,
  XYZDataSource,
  XYZDataSourceOptions
} from './datasources';
import { WFSService } from './datasources/wfs.service';
import { OptionsService } from './options/options.service';

@Injectable({
  providedIn: 'root'
})
export class DataSourceService {
  public datasources$ = new BehaviorSubject<DataSource[]>([]);

  constructor(
    private capabilitiesService: CapabilitiesService,
    @Optional() private optionsService: OptionsService,
    private wfsDataSourceService: WFSService,
    private ogcFilterService: OGCFilterService,
    private languageService: LanguageService,
    private messageService: MessageService,
    private authInterceptor?: AuthInterceptor
  ) {}

  createAsyncDataSource(
    context: AnyDataSourceOptions,
    detailedContextUri?: string
  ): Observable<DataSource> {
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
      case 'wms': {
        const wmsContext = context as WMSDataSourceOptions;
        ObjectUtils.removeDuplicateCaseInsensitive(wmsContext.params);
        dataSource = this.createWMSDataSource(wmsContext, detailedContextUri);
        break;
      }
      case 'wmts':
        dataSource = this.createWMTSDataSource(
          context as WMTSDataSourceOptions
        );
        break;
      case 'xyz':
        dataSource = this.createXYZDataSource(context as XYZDataSourceOptions);
        break;
      case 'tiledebug':
        dataSource = this.createTileDebugDataSource(
          context as TileDebugDataSource
        );
        break;
      case 'carto':
        dataSource = this.createCartoDataSource(
          context as CartoDataSourceOptions
        );
        break;
      case 'arcgisrest':
        dataSource = this.createArcGISRestDataSource(
          context as ArcGISRestDataSourceOptions,
          detailedContextUri
        );
        break;
      case 'imagearcgisrest':
        dataSource = this.createArcGISRestImageDataSource(
          context as ArcGISRestImageDataSourceOptions,
          detailedContextUri
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
          context as TileArcGISRestDataSourceOptions,
          detailedContextUri
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
    return new Observable((d) => d.next(new OSMDataSource(context)));
  }

  private createFeatureDataSource(
    context: FeatureDataSourceOptions
  ): Observable<FeatureDataSource> {
    return new Observable((d) => d.next(new FeatureDataSource(context)));
  }

  private createWebSocketDataSource(
    context: FeatureDataSourceOptions
  ): Observable<WebSocketDataSource> {
    return new Observable((d) => d.next(new WebSocketDataSource(context)));
  }

  private createWFSDataSource(
    context: WFSDataSourceOptions
  ): Observable<WFSDataSource> {
    return new Observable((d) =>
      d.next(
        new WFSDataSource(
          context,
          this.wfsDataSourceService,
          this.ogcFilterService,
          this.authInterceptor
        )
      )
    );
  }

  private createWMSDataSource(
    context: WMSDataSourceOptions,
    detailedContextUri?: string
  ): Observable<any> {
    const observables = [];
    if (context.optionsFromCapabilities && window.navigator.onLine) {
      observables.push(
        this.capabilitiesService.getWMSOptions(context).pipe(
          catchError((e) => {
            this.messageService.error(
              'igo.geo.dataSource.unavailable',
              'igo.geo.dataSource.unavailableTitle',
              undefined,
              { value: context.params.LAYERS }
            );
            throw e;
          })
        )
      );
    }

    if (
      this.optionsService &&
      context.optionsFromApi &&
      window.navigator.onLine
    ) {
      observables.push(
        this.optionsService.getWMSOptions(context, detailedContextUri).pipe(
          catchError((e) => {
            e.error.toDisplay = true;
            e.error.title = this.languageService.translate.instant(
              'igo.geo.dataSource.unavailableTitle'
            );
            e.error.message = this.languageService.translate.instant(
              'igo.geo.dataSource.optionsApiUnavailable'
            );
            return of({});
          })
        )
      );
    }

    observables.push(of(context));

    return forkJoin(observables).pipe(
      map((options: WMSDataSourceOptions[]) => {
        const optionsMerged = options.reduce((a, b) =>
          ObjectUtils.mergeDeep(a, b)
        );

        if (optionsMerged?.params) {
          optionsMerged.params = this.normalizeParams(optionsMerged.params);
        }

        return new WMSDataSource(
          optionsMerged,
          this.wfsDataSourceService,
          this.ogcFilterService
        );
      }),
      catchError(() => {
        return of(undefined);
      })
    );
  }

  private normalizeParams(
    params: WMSDataSourceOptionsParams
  ): WMSDataSourceOptionsParams {
    const uppercasedParams: Partial<WMSDataSourceOptionsParams> = {};
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        uppercasedParams[key.toUpperCase()] = params[key];
      }
    }

    return uppercasedParams as WMSDataSourceOptionsParams;
  }

  private createWMTSDataSource(
    context: WMTSDataSourceOptions
  ): Observable<WMTSDataSource> {
    if (context.optionsFromCapabilities && window.navigator.onLine) {
      return this.capabilitiesService.getWMTSOptions(context).pipe(
        map((options: WMTSDataSourceOptions) => {
          return options ? new WMTSDataSource(options) : undefined;
        }),
        catchError(() => {
          this.messageService.error(
            'igo.geo.dataSource.unavailable',
            'igo.geo.dataSource.unavailableTitle',
            undefined,
            { value: context.layer }
          );
          return of(undefined);
        })
      );
    }

    return new Observable((d) => d.next(new WMTSDataSource(context)));
  }

  private createXYZDataSource(
    context: XYZDataSourceOptions
  ): Observable<XYZDataSource> {
    return new Observable((d) => d.next(new XYZDataSource(context)));
  }

  private createTileDebugDataSource(
    context: TileDebugDataSourceOptions
  ): Observable<TileDebugDataSource> {
    return new Observable((d) => d.next(new TileDebugDataSource(context)));
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
    return new Observable((d) => d.next(new CartoDataSource(context)));
  }

  private createArcGISRestDataSource(
    context: ArcGISRestDataSourceOptions,
    detailedContextUri?: string
  ): Observable<ArcGISRestDataSource> {
    const observables = [];
    if (window.navigator.onLine) {
      observables.push(
        this.capabilitiesService.getArcgisOptions(context).pipe(
          catchError((e) => {
            this.messageService.error(
              'igo.geo.dataSource.unavailable',
              'igo.geo.dataSource.unavailableTitle',
              undefined,
              { value: context.layer }
            );
            throw e;
          })
        )
      );
    }
    if (
      this.optionsService &&
      context.optionsFromApi &&
      window.navigator.onLine
    ) {
      observables.push(
        this.optionsService
          .getArcgisRestOptions(context, detailedContextUri)
          .pipe(
            catchError((e) => {
              e.error.toDisplay = true;
              e.error.title = this.languageService.translate.instant(
                'igo.geo.dataSource.unavailableTitle'
              );
              e.error.message = this.languageService.translate.instant(
                'igo.geo.dataSource.optionsApiUnavailable'
              );
              return of({});
            })
          )
      );
    }
    observables.push(of(context));
    return forkJoin(observables).pipe(
      map((options: ArcGISRestDataSource[]) => {
        const optionsMerged = options.reduce((a, b) =>
          ObjectUtils.mergeDeep(a, b)
        );
        return new ArcGISRestDataSource(optionsMerged);
      }),
      catchError(() => {
        return of(undefined);
      })
    );
  }

  private createArcGISRestImageDataSource(
    context: ArcGISRestImageDataSourceOptions,
    detailedContextUri?: string
  ): Observable<ArcGISRestImageDataSourceOptions> {
    const observables = [];

    if (window.navigator.onLine) {
      observables.push(
        this.capabilitiesService.getImageArcgisOptions(context).pipe(
          catchError((e) => {
            this.messageService.error(
              'igo.geo.dataSource.unavailable',
              'igo.geo.dataSource.unavailableTitle',
              undefined,
              { value: context.params.LAYERS }
            );
            throw e;
          })
        )
      );
    }
    if (
      this.optionsService &&
      context.optionsFromApi &&
      window.navigator.onLine
    ) {
      observables.push(
        this.optionsService
          .getArcgisRestOptions(context, detailedContextUri)
          .pipe(
            catchError((e) => {
              e.error.toDisplay = true;
              e.error.title = this.languageService.translate.instant(
                'igo.geo.dataSource.unavailableTitle'
              );
              e.error.message = this.languageService.translate.instant(
                'igo.geo.dataSource.optionsApiUnavailable'
              );
              return of({});
            })
          )
      );
    }
    observables.push(of(context));
    return forkJoin(observables).pipe(
      map((options: ImageArcGISRestDataSource[]) => {
        const optionsMerged = options.reduce((a, b) =>
          ObjectUtils.mergeDeep(a, b)
        );
        return new ImageArcGISRestDataSource(optionsMerged);
      }),
      catchError(() => {
        return of(undefined);
      })
    );
  }

  private createTileArcGISRestDataSource(
    context: TileArcGISRestDataSourceOptions,
    detailedContextUri?: string
  ): Observable<TileArcGISRestDataSource> {
    const observables = [];
    if (window.navigator.onLine) {
      observables.push(
        this.capabilitiesService.getImageArcgisOptions(context).pipe(
          catchError((e) => {
            this.messageService.error(
              'igo.geo.dataSource.unavailable',
              'igo.geo.dataSource.unavailableTitle',
              undefined,
              { value: context.params.LAYERS }
            );
            throw e;
          })
        )
      );
    }
    if (
      this.optionsService &&
      context.optionsFromApi &&
      window.navigator.onLine
    ) {
      observables.push(
        this.optionsService
          .getArcgisRestOptions(context, detailedContextUri)
          .pipe(
            catchError((e) => {
              e.error.toDisplay = true;
              e.error.title = this.languageService.translate.instant(
                'igo.geo.dataSource.unavailableTitle'
              );
              e.error.message = this.languageService.translate.instant(
                'igo.geo.dataSource.optionsApiUnavailable'
              );
              return of({});
            })
          )
      );
    }
    observables.push(of(context));
    return forkJoin(observables).pipe(
      map((options: TileArcGISRestDataSource[]) => {
        const optionsMerged = options.reduce((a, b) =>
          ObjectUtils.mergeDeep(a, b)
        );
        return new TileArcGISRestDataSource(optionsMerged);
      }),
      catchError(() => {
        return of(undefined);
      })
    );
  }

  private createMVTDataSource(
    context: MVTDataSourceOptions
  ): Observable<MVTDataSource> {
    return new Observable((d) => d.next(new MVTDataSource(context)));
  }

  private createClusterDataSource(
    context: ClusterDataSourceOptions
  ): Observable<ClusterDataSource> {
    return new Observable((d) => d.next(new ClusterDataSource(context)));
  }
}

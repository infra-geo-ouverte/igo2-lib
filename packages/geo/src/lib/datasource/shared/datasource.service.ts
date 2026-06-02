import { Injectable, inject } from '@angular/core';

import { AuthInterceptor } from '@igo2/auth';
import { LanguageService } from '@igo2/core/language';
import { MessageService } from '@igo2/core/message';
import { ObjectUtils } from '@igo2/utils';

import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { OGCFilterService } from '../../filter/shared/ogc-filter.service';
import { CapabilitiesService } from './capabilities.service';
import {
  AnyDataSource,
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
  private capabilitiesService = inject(CapabilitiesService);
  private optionsService = inject(OptionsService, { optional: true });
  private wfsDataSourceService = inject(WFSService);
  private ogcFilterService = inject(OGCFilterService);
  private languageService = inject(LanguageService);
  private messageService = inject(MessageService);
  private authInterceptor = inject(AuthInterceptor);

  createAsyncDataSource(
    options: AnyDataSourceOptions,
    detailedContextUri?: string
  ): Observable<DataSource> {
    if (!options.type) {
      console.error(options);
      throw new Error('Datasource needs a type');
    }
    let dataSource$: Observable<AnyDataSource>;
    switch (options.type.toLowerCase()) {
      case 'osm':
        dataSource$ = this.createOSMDataSource(options as OSMDataSourceOptions);
        break;
      case 'vector':
        dataSource$ = this.createFeatureDataSource(
          options as FeatureDataSourceOptions
        );
        break;
      case 'wfs':
        dataSource$ = this.createWFSDataSource(options as WFSDataSourceOptions);
        break;
      case 'wms': {
        const wmsContext = options as WMSDataSourceOptions;
        ObjectUtils.removeDuplicateCaseInsensitive(wmsContext.params);
        dataSource$ = this.createWMSDataSource(wmsContext, detailedContextUri);
        break;
      }
      case 'wmts':
        dataSource$ = this.createWMTSDataSource(
          options as WMTSDataSourceOptions
        );
        break;
      case 'xyz':
        dataSource$ = this.createXYZDataSource(options as XYZDataSourceOptions);
        break;
      case 'tiledebug':
        dataSource$ = this.createTileDebugDataSource(
          options as TileDebugDataSource
        );
        break;
      case 'carto':
        dataSource$ = this.createCartoDataSource(
          options as CartoDataSourceOptions
        );
        break;
      case 'arcgisrest':
        dataSource$ = this.createArcGISRestDataSource(
          options as ArcGISRestDataSourceOptions,
          detailedContextUri
        );
        break;
      case 'imagearcgisrest':
        dataSource$ = this.createArcGISRestImageDataSource(
          options as ArcGISRestImageDataSourceOptions,
          detailedContextUri
        );
        break;
      case 'websocket':
        dataSource$ = this.createWebSocketDataSource(
          options as FeatureDataSourceOptions
        );
        break;
      case 'mvt':
        dataSource$ = this.createMVTDataSource(options as MVTDataSourceOptions);
        break;
      case 'tilearcgisrest':
        dataSource$ = this.createTileArcGISRestDataSource(
          options as TileArcGISRestDataSourceOptions,
          detailedContextUri
        );
        break;
      case 'cluster':
        dataSource$ = this.createClusterDataSource(
          options as ClusterDataSourceOptions
        );
        break;
      default:
        console.error(options);
        throw new Error('Invalid datasource type');
    }

    return dataSource$;
  }

  private createOSMDataSource(
    options: OSMDataSourceOptions
  ): Observable<OSMDataSource> {
    return new Observable((d) => d.next(new OSMDataSource(options)));
  }

  private createFeatureDataSource(
    options: FeatureDataSourceOptions
  ): Observable<FeatureDataSource> {
    return new Observable((d) => d.next(new FeatureDataSource(options)));
  }

  private createWebSocketDataSource(
    options: FeatureDataSourceOptions
  ): Observable<WebSocketDataSource> {
    return new Observable((d) => d.next(new WebSocketDataSource(options)));
  }

  private createWFSDataSource(
    options: WFSDataSourceOptions
  ): Observable<WFSDataSource> {
    return new Observable((d) =>
      d.next(
        new WFSDataSource(
          options,
          this.wfsDataSourceService,
          this.ogcFilterService,
          this.authInterceptor
        )
      )
    );
  }

  private createWMSDataSource(
    options: WMSDataSourceOptions,
    detailedContextUri?: string
  ): Observable<any> {
    const observables = [];
    if (options.optionsFromCapabilities && window.navigator.onLine) {
      observables.push(
        this.capabilitiesService.getWMSOptions(options).pipe(
          catchError((e) => {
            this.messageService.error(
              'igo.geo.dataSource.unavailable',
              'igo.geo.dataSource.unavailableTitle',
              undefined,
              { value: options.params.LAYERS }
            );
            throw e;
          })
        )
      );
    }

    if (
      this.optionsService &&
      options.optionsFromApi &&
      window.navigator.onLine
    ) {
      observables.push(
        this.optionsService.getWMSOptions(options, detailedContextUri).pipe(
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

    observables.push(of(options));

    return forkJoin(observables).pipe(
      map((opts) => {
        const optionsMerged = opts.reduce((a, b) =>
          ObjectUtils.mergeDeep(a, b)
        ) as WMSDataSourceOptions;

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
        (uppercasedParams as unknown as Record<string, unknown>)[
          key.toUpperCase()
        ] = (params as unknown as Record<string, unknown>)[key];
      }
    }

    return uppercasedParams as WMSDataSourceOptionsParams;
  }

  private createWMTSDataSource(
    options: WMTSDataSourceOptions
  ): Observable<WMTSDataSource> {
    if (options.optionsFromCapabilities && window.navigator.onLine) {
      return this.capabilitiesService.getWMTSOptions(options).pipe(
        map((opts: WMTSDataSourceOptions) => new WMTSDataSource(opts)),
        catchError(() => {
          this.messageService.error(
            'igo.geo.dataSource.unavailable',
            'igo.geo.dataSource.unavailableTitle',
            undefined,
            { value: options.layer }
          );
          return of(undefined as unknown as WMTSDataSource);
        })
      );
    }

    return new Observable((d) => d.next(new WMTSDataSource(options)));
  }

  private createXYZDataSource(
    options: XYZDataSourceOptions
  ): Observable<XYZDataSource> {
    return new Observable((d) => d.next(new XYZDataSource(options)));
  }

  private createTileDebugDataSource(
    options: TileDebugDataSourceOptions
  ): Observable<TileDebugDataSource> {
    return new Observable((d) => d.next(new TileDebugDataSource(options)));
  }

  private createCartoDataSource(
    options: CartoDataSourceOptions
  ): Observable<CartoDataSource> {
    if (options.mapId) {
      return this.capabilitiesService
        .getCartoOptions(options)
        .pipe(
          map((options: CartoDataSourceOptions) => new CartoDataSource(options))
        );
    }
    return new Observable((d) => d.next(new CartoDataSource(options)));
  }

  private createArcGISRestDataSource(
    options: ArcGISRestDataSourceOptions,
    detailedContextUri?: string
  ): Observable<ArcGISRestDataSource> {
    const observables = [];
    if (window.navigator.onLine) {
      observables.push(
        this.capabilitiesService.getArcgisOptions(options).pipe(
          catchError((e) => {
            this.messageService.error(
              'igo.geo.dataSource.unavailable',
              'igo.geo.dataSource.unavailableTitle',
              undefined,
              { value: options.layer }
            );
            throw e;
          })
        )
      );
    }
    if (
      this.optionsService &&
      options.optionsFromApi &&
      window.navigator.onLine
    ) {
      observables.push(
        this.optionsService
          .getArcgisRestOptions(options, detailedContextUri)
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
    observables.push(of(options));
    return forkJoin(observables).pipe(
      map((opts) => {
        const optionsMerged = opts.reduce((a, b) =>
          ObjectUtils.mergeDeep(a, b)
        );
        return new ArcGISRestDataSource(optionsMerged);
      }),
      catchError(() => {
        return of(undefined);
      })
    ) as Observable<ArcGISRestDataSource>;
  }

  private createArcGISRestImageDataSource(
    options: ArcGISRestImageDataSourceOptions,
    detailedContextUri?: string
  ): Observable<ImageArcGISRestDataSource> {
    const observables = [];

    if (window.navigator.onLine) {
      observables.push(
        this.capabilitiesService.getImageArcgisOptions(options).pipe(
          catchError((e) => {
            this.messageService.error(
              'igo.geo.dataSource.unavailable',
              'igo.geo.dataSource.unavailableTitle',
              undefined,
              { value: options.params.LAYERS }
            );
            throw e;
          })
        )
      );
    }
    if (
      this.optionsService &&
      options.optionsFromApi &&
      window.navigator.onLine
    ) {
      observables.push(
        this.optionsService
          .getArcgisRestOptions(options, detailedContextUri)
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
    observables.push(of(options));
    return forkJoin(observables).pipe(
      map((opts) => {
        const optionsMerged = opts.reduce((a, b) =>
          ObjectUtils.mergeDeep(a, b)
        );
        return new ImageArcGISRestDataSource(optionsMerged);
      }),
      catchError(() => {
        return of(undefined);
      })
    ) as Observable<ImageArcGISRestDataSource>;
  }

  private createTileArcGISRestDataSource(
    options: TileArcGISRestDataSourceOptions,
    detailedContextUri?: string
  ): Observable<TileArcGISRestDataSource> {
    const observables = [];
    if (window.navigator.onLine) {
      observables.push(
        this.capabilitiesService.getImageArcgisOptions(options).pipe(
          catchError((e) => {
            this.messageService.error(
              'igo.geo.dataSource.unavailable',
              'igo.geo.dataSource.unavailableTitle',
              undefined,
              { value: options.params.LAYERS }
            );
            throw e;
          })
        )
      );
    }
    if (
      this.optionsService &&
      options.optionsFromApi &&
      window.navigator.onLine
    ) {
      observables.push(
        this.optionsService
          .getArcgisRestOptions(options, detailedContextUri)
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
    observables.push(of(options));
    return forkJoin(observables).pipe(
      map((opts) => {
        const optionsMerged = opts.reduce((a, b) =>
          ObjectUtils.mergeDeep(a, b)
        );
        return new TileArcGISRestDataSource(optionsMerged);
      }),
      catchError(() => {
        return of(undefined);
      })
    ) as Observable<TileArcGISRestDataSource>;
  }

  private createMVTDataSource(
    options: MVTDataSourceOptions
  ): Observable<MVTDataSource> {
    return new Observable((d) => d.next(new MVTDataSource(options)));
  }

  private createClusterDataSource(
    options: ClusterDataSourceOptions
  ): Observable<ClusterDataSource> {
    return new Observable((d) => d.next(new ClusterDataSource(options)));
  }
}

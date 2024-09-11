import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';

import { AuthService } from '@igo2/auth';
import { Tool } from '@igo2/common/tool';
import { ConfigService } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { Message, MessageService } from '@igo2/core/message';
import { RouteService } from '@igo2/core/route';
import { StorageService } from '@igo2/core/storage';
import type { AnyLayer, IgoMap, Layer } from '@igo2/geo';
import { ExportService, isLayerGroup } from '@igo2/geo';
import { ObjectUtils, uuid } from '@igo2/utils';

import GeoJSON from 'ol/format/GeoJSON';
import { Geometry } from 'ol/geom';
import olPoint from 'ol/geom/Point';
import Cluster from 'ol/source/Cluster';
import olVectorSource from 'ol/source/Vector';

import { Feature } from 'ol';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  first,
  map,
  mergeMap,
  skip,
  tap
} from 'rxjs/operators';

import { TypePermission } from './context.enum';
import {
  Context,
  ContextMapView,
  ContextPermission,
  ContextProfils,
  ContextServiceOptions,
  ContextsList,
  DetailedContext,
  ExtraFeatures
} from './context.interface';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  public context$ = new BehaviorSubject<DetailedContext>(undefined);
  public contexts$ = new BehaviorSubject<ContextsList>({ ours: [] });
  public defaultContextId$ = new BehaviorSubject<string>(undefined);
  public editedContext$ = new BehaviorSubject<DetailedContext>(undefined);
  public importedContext: DetailedContext[] = [];
  public toolsChanged$ = new Subject<DetailedContext>();
  private mapViewFromRoute: ContextMapView = {};
  private options: ContextServiceOptions;
  private baseUrl: string;

  // Until the ContextService is completely refactored, this is needed
  // to track the current tools
  private tools: Tool[];
  private toolbar: string[];

  get defaultContextUri(): string {
    return (
      (this.storageService.get('favorite.context.uri') as string) ||
      this._defaultContextUri ||
      this.options.defaultContextUri
    );
  }
  set defaultContextUri(uri: string) {
    this._defaultContextUri = uri;
  }
  private _defaultContextUri: string;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private languageService: LanguageService,
    private config: ConfigService,
    private messageService: MessageService,
    private storageService: StorageService,
    private exportService: ExportService,
    @Optional() private route: RouteService
  ) {
    this.options = Object.assign(
      {
        basePath: 'contexts',
        contextListFile: '_contexts.json',
        defaultContextUri: '_default'
      },
      this.config.getConfig('context')
    );

    this.baseUrl = this.options.url ?? '';

    this.readParamsFromRoute();

    if (this.authService.hasAuthService) {
      this.authService.logged$.subscribe((logged) => {
        if (logged) {
          this.contexts$.pipe(skip(1), first()).subscribe(() => {
            this.handleContextsChange();
          });
          this.loadContexts();
        }
      });
    } else {
      this.loadContexts();
      this.handleContextsChange(false);
    }
  }

  get(permissions?: string[], hidden?: boolean): Observable<ContextsList> {
    let url = this.baseUrl + '/contexts';
    if (permissions && this.authService.authenticated) {
      url += '?permission=' + permissions.join();
      if (hidden) {
        url += '&hidden=true';
      }
    }
    return this.http.get<ContextsList>(url);
  }

  getById(id: string): Observable<Context> {
    const url = this.baseUrl + '/contexts/' + id;
    return this.http.get<Context>(url);
  }

  getDetails(id: string): Observable<DetailedContext> {
    const url = `${this.baseUrl}/contexts/${id}/details`;
    return this.http.get<DetailedContext>(url).pipe(
      catchError((res) => {
        this.handleError(res, id);
        throw res;
      })
    );
  }

  getDefault(): Observable<DetailedContext> {
    if (this.authService.authenticated) {
      const url = this.baseUrl + '/contexts/default';
      return this.http.get<DetailedContext>(url).pipe(
        tap((context) => {
          this.defaultContextId$.next(context.id);
        })
      );
    } else {
      const uri = this.storageService.get('favorite.context.uri') as string;
      this.defaultContextId$.next(uri);
      return this.getContextByUri(uri);
    }
  }

  getProfilByUser(): Observable<ContextProfils[]> {
    if (this.baseUrl) {
      const url = this.baseUrl + '/profils?';
      return this.http.get<ContextProfils[]>(url);
    }
    return of([]);
  }

  setDefault(id: string): Observable<any> {
    if (this.authService.authenticated) {
      const url = this.baseUrl + '/contexts/default';
      return this.http.post(url, { defaultContextId: id });
    } else {
      this.storageService.set('favorite.context.uri', id);
      return of(undefined);
    }
  }

  hideContext(id: string) {
    const url = this.baseUrl + '/contexts/' + id + '/hide';
    return this.http.post(url, {});
  }

  showContext(id: string) {
    const url = this.baseUrl + '/contexts/' + id + '/show';
    return this.http.post(url, {});
  }

  delete(id: string, imported = false): Observable<void> {
    const contexts: ContextsList = { ours: [] };
    Object.keys(this.contexts$.value).forEach(
      (key) =>
        (contexts[key] = this.contexts$.value[key].filter((c) => c.id !== id))
    );

    if (imported) {
      this.importedContext = this.importedContext.filter((c) => c.id !== id);
      return of(this.contexts$.next(contexts));
    }

    const url = this.baseUrl + '/contexts/' + id;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this.contexts$.next(contexts);
      })
    );
  }

  create(context: DetailedContext): Observable<Context> {
    const url = this.baseUrl + '/contexts';
    return this.http.post<Context>(url, context).pipe(
      map((contextCreated) => {
        if (this.authService.authenticated) {
          contextCreated.permission = TypePermission[TypePermission.write];
        } else {
          contextCreated.permission = TypePermission[TypePermission.read];
        }
        this.contexts$.value.ours.unshift(contextCreated);
        this.contexts$.next(this.contexts$.value);
        return contextCreated;
      })
    );
  }

  clone(id: string, properties = {}): Observable<Context> {
    const url = this.baseUrl + '/contexts/' + id + '/clone';
    return this.http.post<Context>(url, properties).pipe(
      map((contextCloned) => {
        contextCloned.permission = TypePermission[TypePermission.write];
        this.contexts$.value.ours.unshift(contextCloned);
        this.contexts$.next(this.contexts$.value);
        return contextCloned;
      })
    );
  }

  update(id: string, context: DetailedContext): Observable<Context> {
    const url = this.baseUrl + '/contexts/' + id;
    return this.http.patch<Context>(url, context);
  }

  // =================================================================

  addToolAssociation(contextId: string, toolId: string): Observable<void> {
    const url = `${this.baseUrl}/contexts/${contextId}/tools`;
    const association = {
      toolId
    };
    return this.http.post<void>(url, association);
  }

  deleteToolAssociation(contextId: string, toolId: string): Observable<any> {
    const url = `${this.baseUrl}/contexts/${contextId}/tools/${toolId}`;
    return this.http.delete(url);
  }

  getPermissions(id: string): Observable<ContextPermission[]> {
    const url = this.baseUrl + '/contexts/' + id + '/permissions';
    return this.http.get<ContextPermission[]>(url);
  }

  addPermissionAssociation(
    contextId: string,
    profil: string,
    type: TypePermission
  ): Observable<ContextPermission[]> {
    const url = `${this.baseUrl}/contexts/${contextId}/permissions`;
    const association = {
      profil,
      typePermission: type
    };

    return this.http.post<ContextPermission[]>(url, association).pipe(
      catchError((res) => {
        this.handleError(res, undefined, true);
        throw [res]; // TODO Not sure about this.
      })
    );
  }

  deletePermissionAssociation(
    contextId: string,
    permissionId: string
  ): Observable<void> {
    const url = `${this.baseUrl}/contexts/${contextId}/permissions/${permissionId}`;
    return this.http.delete<void>(url);
  }

  // ======================================================================

  getLocalContexts(): Observable<ContextsList> {
    const url = this.getPath(this.options.contextListFile);
    return this.http.get<ContextsList>(url).pipe(
      map((res: any) => {
        return { ours: res };
      })
    );
  }

  getLocalContext(uri: string): Observable<DetailedContext> {
    const url = this.getPath(`${uri}.json`);
    return this.http.get<DetailedContext>(url).pipe(
      mergeMap((res) => {
        if (!res.base) {
          return of(res);
        }
        const urlBase = this.getPath(`${res.base}.json`);
        return this.http.get<DetailedContext>(urlBase).pipe(
          map((resBase: DetailedContext) => {
            const resMerge = res;
            resMerge.map = ObjectUtils.mergeDeep(resBase.map, res.map);
            resMerge.layers = (resBase.layers || [])
              .concat(res.layers || [])
              .reverse()
              .filter(
                (l, index, self) =>
                  !l.id || self.findIndex((l2) => l2.id === l.id) === index
              )
              .reverse();
            resMerge.toolbar = res.toolbar || resBase.toolbar;
            resMerge.message = res.message || resBase.message;
            resMerge.messages = res.messages || resBase.messages;
            resMerge.tools = (res.tools || [])
              .concat(resBase.tools || [])
              .filter(
                (t, index, self) =>
                  self.findIndex((t2) => t2.name === t.name) === index
              );
            return resMerge;
          }),
          catchError((err) => {
            this.handleError(err, uri);
            throw err;
          })
        );
      }),
      catchError((err2) => {
        this.handleError(err2, uri);
        throw err2;
      })
    );
  }

  loadContexts(permissions?: string[], hidden?: boolean) {
    let request;
    if (this.baseUrl) {
      request = this.get(permissions, hidden);
    } else {
      request = this.getLocalContexts();
    }
    request.subscribe((contexts) => {
      contexts.ours = this.importedContext.concat(contexts.ours);
      this.contexts$.next(contexts);
    });
  }

  loadDefaultContext() {
    const loadFct = (direct = false) => {
      if (!direct && this.baseUrl && this.authService.authenticated) {
        this.getDefault().subscribe(
          (_context: DetailedContext) => {
            this.defaultContextUri = _context.uri;
            this.addContextToList(_context);
            this.setContext(_context);
          },
          () => {
            this.defaultContextId$.next(undefined);
            this.loadContext(this.defaultContextUri);
          }
        );
      } else {
        this.loadContext(this.defaultContextUri);
      }
    };

    if (this.route && this.route.options.contextKey) {
      this.route.queryParams.pipe(debounceTime(100)).subscribe((params) => {
        const contextParam = params[this.route.options.contextKey as string];
        let direct = false;
        if (contextParam) {
          this.defaultContextUri = contextParam;
          direct = true;
        }
        loadFct(direct);
      });
    } else {
      loadFct();
    }
  }

  loadContext(uri: string) {
    const context = this.context$.value;

    if (context && context.uri === uri) {
      return;
    }

    this.getContextByUri(uri)
      .pipe(first())
      .subscribe(
        (_context: DetailedContext) => {
          this.addContextToList(_context);
          this.setContext(_context);
        },
        () => {
          if (uri !== this.options.defaultContextUri) {
            this.loadContext(this.options.defaultContextUri);
          }
        }
      );
  }

  setContext(context: DetailedContext) {
    this.handleContextMessage(context);
    const currentContext = this.context$.value;
    if (currentContext && context && context.id === currentContext.id) {
      if (context.map.view.keepCurrentView === undefined) {
        context.map.view.keepCurrentView = true;
      }
      this.context$.next(context);
      return;
    }

    if (!context.map) {
      context.map = { view: {} };
    }

    Object.assign(context.map.view, this.mapViewFromRoute);

    this.context$.next(context);
  }

  loadEditedContext(uri: string) {
    this.getContextByUri(uri).subscribe((_context: DetailedContext) => {
      this.setEditedContext(_context);
    });
  }

  setEditedContext(context: DetailedContext) {
    this.editedContext$.next(context);
  }

  getContextFromMap(igoMap: IgoMap, empty?: boolean): DetailedContext {
    const view = igoMap.ol.getView();
    const proj = view.getProjection().getCode();
    const center = new olPoint(view.getCenter()).transform(proj, 'EPSG:4326');

    const context: DetailedContext = {
      uri: uuid(),
      title: '',
      scope: 'private',
      map: {
        view: {
          center: center.getCoordinates() as [number, number],
          zoom: view.getZoom(),
          projection: proj,
          maxZoomOnExtent: igoMap.viewController.maxZoomOnExtent
        }
      },
      layers: [],
      tools: []
    };

    const layers: AnyLayer[] = empty
      ? []
      : [...igoMap.layerController.treeLayers];

    const baseLayer = igoMap.layerController.baseLayer;
    if (baseLayer) {
      layers.unshift(baseLayer);
    }

    // Remove null for the first level, the LayerGroup is already doing that for it's children
    context.layers = layers
      .map((layer) => layer.saveableOptions)
      .filter(Boolean);

    context.tools = this.tools.map((tool) => {
      return {
        id: String(tool.id),
        global: tool.global
      } as Tool;
    });

    return context;
  }

  getContextFromLayers(
    igoMap: IgoMap,
    layers: AnyLayer[],
    name: string,
    keepCurrentView?: boolean
  ): DetailedContext {
    const view = igoMap.ol.getView();
    const proj = view.getProjection().getCode();
    const center = new olPoint(view.getCenter()).transform(proj, 'EPSG:4326');

    const context: DetailedContext = {
      uri: name,
      title: name,
      map: {
        view: {
          center: center.getCoordinates() as [number, number],
          zoom: view.getZoom(),
          projection: proj,
          keepCurrentView
        }
      },
      layers: [],
      toolbar: [],
      tools: [],
      extraFeatures: []
    };

    context.layers = igoMap.layerController.baseLayers.map((l: Layer) => {
      return {
        baseLayer: true,
        sourceOptions: l.options.sourceOptions,
        title: l.options.title,
        visible: l.visible
      };
    });

    layers.forEach((layer) => {
      if (isLayerGroup(layer)) {
        return context.layers.push(layer.options);
      }
      if (!(layer.ol.getSource() instanceof olVectorSource)) {
        const layerOptions = layer.options;
        layerOptions.zIndex = layer.zIndex;
        layerOptions.visible = layer.visible;
        layerOptions.opacity = layer.opacity;
        delete layerOptions.source;
        context.layers.push(layerOptions);
      } else {
        if (!(layer.ol.getSource() instanceof olVectorSource)) {
          const catalogLayer = layer.options;
          catalogLayer.zIndex = layer.zIndex;
          catalogLayer.visible = layer.visible;
          catalogLayer.opacity = layer.opacity;
          delete catalogLayer.source;
          context.layers.push(catalogLayer);
        } else {
          const extraFeatures = this.getExtraFeatures(layer);
          extraFeatures.name = layer.options.title;
          extraFeatures.opacity = layer.opacity;
          extraFeatures.visible = layer.visible;
          context.extraFeatures.push(extraFeatures);
        }
      }
    });

    context.toolbar = this.toolbar;
    context.tools = this.tools;

    return context;
  }

  private getExtraFeatures(layer: Layer): ExtraFeatures {
    const writer = new GeoJSON();
    let olFeatures: Feature<Geometry>[];
    if (layer.ol.getSource() instanceof Cluster) {
      const clusterSource = layer.ol.getSource() as Cluster;
      olFeatures = clusterSource.getFeatures();
      olFeatures = (olFeatures as any).flatMap((cluster: any) =>
        cluster.get('features')
      );
    } else {
      const source = layer.ol.getSource() as olVectorSource;
      olFeatures = source.getFeatures();
    }
    const cleanedOlFeatures = this.exportService.cleanFeatures(
      olFeatures,
      'GeoJSON',
      '_featureStore'
    );
    const features = writer.writeFeatures(cleanedOlFeatures, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    });
    return JSON.parse(features);
  }

  setTools(tools: Tool[]) {
    this.tools = tools;
  }

  setToolbar(toolbar: string[]) {
    this.toolbar = toolbar;
  }

  private handleContextMessage(context: DetailedContext) {
    if (
      this.context$.value &&
      context.uri &&
      this.context$.value.uri !== context.uri
    ) {
      this.messageService.removeAllAreNotError();
    }

    context.messages = context.messages ? context.messages : [];
    context.messages.push(context.message);
    context.messages.map((message) => {
      if (message) {
        this.messageService.message(message as Message);
      }
    });
  }

  private getContextByUri(uri: string): Observable<DetailedContext> {
    if (this.baseUrl) {
      let contextToLoad;
      for (const key of Object.keys(this.contexts$.value)) {
        contextToLoad = this.contexts$.value[key].find((c) => {
          return c.uri === uri;
        });
        if (contextToLoad) {
          break;
        }
      }

      if (contextToLoad && contextToLoad.imported) {
        return of(contextToLoad);
      }

      // TODO : use always id or uri
      const id = contextToLoad ? contextToLoad.id : uri;
      return this.getDetails(id);
    }

    const importedContext = this.contexts$.value.ours.find((currentContext) => {
      return currentContext.uri === uri && currentContext.imported === true;
    });

    if (importedContext) {
      return of(importedContext);
    } else {
      return this.getLocalContext(uri);
    }
  }

  getContextLayers(map: IgoMap) {
    return map.layerController.treeLayers;
  }

  private readParamsFromRoute() {
    if (!this.route) {
      return;
    }

    this.route.queryParams.subscribe((params) => {
      const centerKey = this.route.options.centerKey;
      if (centerKey && params[centerKey as string]) {
        const centerParams = params[centerKey as string];
        this.mapViewFromRoute.center = centerParams.split(',').map(Number);
      }

      const projectionKey = this.route.options.projectionKey;
      if (projectionKey && params[projectionKey as string]) {
        const projectionParam = params[projectionKey as string];
        this.mapViewFromRoute.projection = projectionParam;
      }

      const zoomKey = this.route.options.zoomKey;
      if (zoomKey && params[zoomKey as string]) {
        const zoomParam = params[zoomKey as string];
        this.mapViewFromRoute.zoom = Number(zoomParam);
      }
    });
  }

  private getPath(file: string) {
    const basePath = this.options.basePath.replace(/\/$/, '');

    return `${basePath}/${file}`;
  }

  private handleError(
    error: HttpErrorResponse,
    uri: string,
    permissionError?: boolean
  ) {
    const context = this.contexts$.value.ours.find((obj) => obj.uri === uri);
    const titleContext = context ? context.title : uri;
    error.error.title = this.languageService.translate.instant(
      'igo.context.contextManager.invalid.title'
    );

    error.error.message = this.languageService.translate.instant(
      'igo.context.contextManager.invalid.text',
      { value: titleContext }
    );

    error.error.toDisplay = true;

    if (permissionError) {
      error.error.title = this.languageService.translate.instant(
        'igo.context.contextManager.errors.addPermissionTitle'
      );
      error.error.message = this.languageService.translate.instant(
        'igo.context.contextManager.errors.addPermission'
      );
    }
    this.messageService.error(
      'igo.context.contextManager.errors.addPermission',
      'igo.context.contextManager.errors.addPermissionTitle'
    );
  }

  private handleContextsChange(keepCurrentContext = true) {
    const context = this.context$.value;
    const editedContext = this.editedContext$.value;
    if (!context || context.uri === this.options.defaultContextUri) {
      keepCurrentContext = false;
    }
    if (!keepCurrentContext || !this.findContext(context)) {
      this.defaultContextUri = undefined;
      this.loadDefaultContext();
    } else {
      this.getContextByUri(context.uri)
        .pipe(first())
        .subscribe((newContext) => {
          this.toolsChanged$.next(newContext);
        });

      if (this.baseUrl && this.authService.authenticated) {
        this.getDefault().subscribe();
      }
    }
    const editedFound = this.findContext(editedContext);
    if (!editedFound || editedFound.permission !== 'write') {
      this.setEditedContext(undefined);
    }
  }

  private addContextToList(context: Context) {
    const contextFound = this.findContext(context);
    if (!contextFound) {
      const contextSimplifie = {
        id: context.id,
        uri: context.uri,
        title: context.title,
        scope: context.scope,
        permission: TypePermission[TypePermission.read]
      };

      if (this.contexts$.value && this.contexts$.value.public) {
        this.contexts$.value.public.push(contextSimplifie);
        this.contexts$.next(this.contexts$.value);
      }
    }
  }

  private findContext(context: Context) {
    if (!context) {
      return false;
    }

    const contexts = this.contexts$.value;
    let found;
    for (const key of Object.keys(contexts)) {
      const value = contexts[key];
      found = value.find(
        (c) =>
          (context.id && c.id === context.id) ||
          (context.uri && c.uri === context.uri)
      );
      if (found) {
        break;
      }
    }

    return found;
  }
}

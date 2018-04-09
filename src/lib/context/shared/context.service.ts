import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { tap } from 'rxjs/operators/tap';
import { catchError } from 'rxjs/operators/catchError';
import { debounceTime } from 'rxjs/operators/debounceTime';

import * as ol from 'openlayers';

import { uuid } from '../../utils/uuid';
import { ConfigService, RouteService,
        Message, LanguageService } from '../../core';

import { AuthService } from '../../auth';

import { IgoMap } from '../../map';
// Import from shared to avoid circular dependencies
import { ToolService } from '../../tool/shared';

import { TypePermission } from './context.enum';
import { ContextsList, ContextServiceOptions, Context, DetailedContext,
  ContextMapView, ContextPermission } from './context.interface';


@Injectable()
export class ContextService {

  public context$ = new BehaviorSubject<DetailedContext>(undefined);
  public contexts$ = new BehaviorSubject<ContextsList>({ours: []});
  public defaultContextId$ = new BehaviorSubject<string>(undefined);
  public editedContext$ = new BehaviorSubject<DetailedContext>(undefined);
  private mapViewFromRoute: ContextMapView = {};
  private options: ContextServiceOptions;
  private baseUrl: string;

  constructor(private http: HttpClient,
              private authService: AuthService,
              private languageService: LanguageService,
              private toolService: ToolService,
              private config: ConfigService,
              @Optional() private route: RouteService) {

    this.options = Object.assign({
      basePath: 'contexts',
      contextListFile: '_contexts.json',
      defaultContextUri: '_default'
    }, this.config.getConfig('context'));

    this.baseUrl = this.options.url;

    this.readParamsFromRoute();

    this.authService.authenticate$
      .subscribe((authenticated) => {
        if (authenticated === null) {
          this.loadDefaultContext();
          return;
        }
        const contexts$$ = this.contexts$.subscribe((contexts) => {
          if (contexts$$) {
            contexts$$.unsubscribe();
            this.handleContextsChange(contexts);
          }
        });
        this.loadContexts();
      });
  }

  get(): Observable<ContextsList> {
    const url = this.baseUrl + '/contexts';
    return this.http.get<ContextsList>(url);
  }

  getById(id: string): Observable<Context> {
    const url = this.baseUrl + '/contexts/' + id;
    return this.http.get<Context>(url);
  }

  getDetails(id: string): Observable<DetailedContext> {
    const url = this.baseUrl + '/contexts/' + id + '/details';
    return this.http.get<DetailedContext>(url).pipe(
      catchError(res => this.handleError(res, id))
    );
  }

  getDefault(): Observable<DetailedContext> {
    const url = this.baseUrl + '/contexts/default';
    return this.http.get<DetailedContext>(url).pipe(
      tap((context) => {
        this.defaultContextId$.next(context.id);
      })
    );
  }

  delete(id: string): Observable<void> {
    const url = this.baseUrl + '/contexts/' + id;
    return this.http.delete<void>(url).pipe(
      tap((res) => {
        const contexts: ContextsList = {ours: []};
        Object.keys(this.contexts$.value).forEach(
          key => contexts[key] = this.contexts$.value[key].filter((c) => c.id !== id)
        );
        this.contexts$.next(contexts);
      })
    );
  }

  create(context: DetailedContext): Observable<Context> {
    const url = this.baseUrl + '/contexts';
    return this.http.post<Context>(url, JSON.stringify(context)).pipe(
      map((contextCreated) => {
        if (this.authService.authenticated) {
          contextCreated.permission = TypePermission[TypePermission.write];
        } else {
          contextCreated.permission = TypePermission[TypePermission.read];
        }
        this.contexts$.value.ours.push(contextCreated);
        this.contexts$.next(this.contexts$.value);
        return contextCreated;
      })
    );
  }

  clone(id: string, properties = {}): Observable<Context> {
    const url = this.baseUrl + '/contexts/' + id + '/clone';
    return this.http.post<Context>(url, JSON.stringify(properties)).pipe(
      map((contextCloned) => {
        contextCloned.permission = TypePermission[TypePermission.write];
        this.contexts$.value.ours.push(contextCloned);
        this.contexts$.next(this.contexts$.value);
        return contextCloned;
      })
    );
  }

  update(id: string, context: Context): Observable<Context> {
    const url = this.baseUrl + '/contexts/' + id;
    return this.http.patch<Context>(url, JSON.stringify(context));
  }

// =================================================================

addToolAssociation(contextId: string, toolId: string): Observable<void> {
  const url = `${this.baseUrl}/contexts/${contextId}/tools`;
  const association = {
    toolId: toolId
  };
  return this.http.post<void>(url, JSON.stringify(association));
}

deleteToolAssociation(contextId: string, toolId: string): Observable<any> {
  const url = `${this.baseUrl}/contexts/${contextId}/tools/${toolId}`;
  return this.http.delete(url);
}

getPermissions(id: string): Observable<ContextPermission[]> {
  const url = this.baseUrl + '/contexts/' + id + '/permissions';
  return this.http.get<ContextPermission[]>(url);
}

addPermissionAssociation(contextId: string, profil: string,
  type: TypePermission): Observable<ContextPermission[]> {

  const url = `${this.baseUrl}/contexts/${contextId}/permissions`;
  const association = {
    profil: profil,
    typePermission: type
  };
  return this.http.post<ContextPermission[]>(url, JSON.stringify(association));
}

deletePermissionAssociation(contextId: string, permissionId: string): Observable<void> {
  const url = `${this.baseUrl}/contexts/${contextId}/permissions/${permissionId}`;
  return this.http.delete<void>(url);
}

// ======================================================================

  getLocalContexts(): Observable<ContextsList> {
    const url = this.getPath(this.options.contextListFile);
    return this.http.get<ContextsList>(url).pipe(
      map((res: any) => { return {ours: res}; })
    );
  }

  getLocalContext(uri): Observable<DetailedContext> {
    const url = this.getPath(`${uri}.json`);
    return this.http.get<DetailedContext>(url).pipe(
      catchError(res => {
        return this.handleError(res, uri);
      })
    );
  }

  loadContexts() {
    let request;
    if (this.baseUrl) {
      request = this.get();
    } else {
      request = this.getLocalContexts();
    }
    request.subscribe(contexts => {
      const publicsContexts = this.contexts$.value.public;

      if (publicsContexts) {
        const contextUri = publicsContexts.find((c) => c.uri === this.options.defaultContextUri);
        if (contextUri) {
          if (!contexts.public) {
            contexts.public = [];
          }
          contexts.public.push(contextUri);
        }
      }
      this.contexts$.next(contexts);
    });
  }

  loadDefaultContext() {

    const loadFct = (direct = false) => {
      if (!direct && this.baseUrl && this.authService.authenticated) {
        this.getDefault().subscribe(
          (_context: DetailedContext) => {
            this.options.defaultContextUri = _context.uri;
            this.addContextToList(_context);
            this.setContext(_context);
          },
          () => {
            this.defaultContextId$.next(undefined);
            this.loadContext(this.options.defaultContextUri);
          }
        );
      } else {
        this.loadContext(this.options.defaultContextUri);
      }
    };

    if (this.route && this.route.options.contextKey) {
      this.route.queryParams.pipe(debounceTime(100)).subscribe(params => {
        const contextParam = params[this.route.options.contextKey as string];
        let direct = false;
        if (contextParam) {
          this.options.defaultContextUri = contextParam;
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
    if (context && context.uri === uri) { return; }

    const contexts$$ = this.getContextByUri(uri).subscribe(
      (_context: DetailedContext) => {
        contexts$$.unsubscribe();
        this.addContextToList(_context);
        this.setContext(_context);
      },
      (err) => {
        contexts$$.unsubscribe();
      });
  }

  setContext(context: DetailedContext) {
    const currentContext = this.context$.value;
    if (currentContext && context && context.id === currentContext.id) {
      context.map.view.keepCurrentView = true;
      this.context$.next(context);
      return;
    }

    // Update the tools options with those found in the context
    if (context.tools !== undefined) {
      this.toolService.setTools(context.tools);
    }

    if (!context.map) {
      context.map = {view: {}};
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

  getContextFromMap(igoMap: IgoMap): DetailedContext {
    const view = igoMap.ol.getView();
    const proj = view.getProjection().getCode();
    const center: any = new ol.geom.Point(view.getCenter()).transform(proj, 'EPSG:4326');

    const context = {
      uri: uuid(),
      title: '',
      scope: 'private',
      map: {
        view: {
          center: center.getCoordinates(),
          zoom: view.getZoom(),
          projection: proj
        }
      },
      layers: [],
      tools: []
    };

    const layers = igoMap.layers$.getValue();

    let order = layers.length;
    for (const l of layers) {
        const layer: any = l;
        const opts = {
          id: layer.options.id ? String(layer.options.id) : undefined,
          title: layer.options.title,
          type: layer.options.type,
          source: {
            params: layer.dataSource.options.params,
            url: layer.dataSource.options.url
          },
          order: order--,
          visible: layer.visible
        };
        context.layers.push(opts);
    }

    const tools = this.toolService.tools$.value;
    for (const key in tools) {
      if (tools.hasOwnProperty(key)) {
        context.tools.push({
          id: String(tools[key].id)
        });
      }
    }

    return context;
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

      // TODO : use always id or uri
      const id = contextToLoad ? contextToLoad.id : uri;
      return this.getDetails(id);
    }

    return this.getLocalContext(uri);
  }

  private readParamsFromRoute() {
    if (!this.route) {
      return;
    }

    this.route.queryParams
      .subscribe(params => {
        const centerKey = this.route.options.centerKey;
        if (centerKey && params[centerKey as string]) {
          const centerParams = params[centerKey as string];
          this.mapViewFromRoute.center = centerParams.split(',').map(Number);
          this.mapViewFromRoute.geolocate = false;
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

  private handleError(res: Response, uri: string): Message[] {
    const context = this.contexts$.value.ours.find((obj) => obj.uri === uri);
    const titleContext = context ? context.title : uri;
    const titleError = this.languageService.translate
      .instant('igo.context.invalid.title');

    const textError = this.languageService.translate
      .instant('igo.context.invalid.text', {value: titleContext});

    throw [{title: titleError, text: textError}];
  }

  private handleContextsChange(contexts: ContextsList, keepCurrentContext = false) {

    const context = this.context$.value;
    const editedContext = this.editedContext$.value;

    if (!keepCurrentContext || !this.findContext(context)) {
      this.loadDefaultContext();
    } else {
      context.map.view.keepCurrentView = true;
      this.context$.next(context);
      this.getDefault().subscribe(() => {});
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
    if (!context || !context.id) {
      return false;
    }

    const contexts = this.contexts$.value;
    let found;
    for (const key of Object.keys(contexts)) {
      const value = contexts[key];
      found = value.find(c => c.id === context.id);
      if (found) {
        break;
      }
    }

    return found;
  }
}

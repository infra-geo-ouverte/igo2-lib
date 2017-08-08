import { Injectable, Optional } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { RequestService, ConfigService, RouteService,
        Message, LanguageService } from '../../core';

import { AuthHttp } from '../../auth';
// Import from shared to avoid circular dependencies
import { ToolService } from '../../tool/shared';

import { ContextsList, ContextServiceOptions,
         DetailedContext, ContextMapView } from './context.interface';

@Injectable()
export class ContextService {

  public context$ = new BehaviorSubject<DetailedContext>(undefined);
  public contexts$ = new BehaviorSubject<ContextsList>({ours: []});
  private mapViewFromRoute: ContextMapView = {};
  private options: ContextServiceOptions;

  constructor(private authHttp: AuthHttp,
              private requestService: RequestService,
              private languageService: LanguageService,
              private toolService: ToolService,
              private config: ConfigService,
              @Optional() private route: RouteService) {

    this.options = Object.assign({
      basePath: 'contexts',
      contextListFile: '_contexts.json',
      defaultContextUri: '_default'
    }, this.config.getConfig('context'));

    this.readParamsFromRoute();
  }

  loadContexts() {
    let url: string;
    if (this.options.url) {
      url = this.options.url + 'contexts';
    } else {
      url = this.getPath(this.options.contextListFile);
    }
    this.requestService.register(
      this.authHttp.get(url)
    )
    .map(res => res.json().ours ? res.json() : {ours: res.json()} )
    .subscribe(contexts => {
      this.contexts$.next(contexts);
    });
  }

  loadDefaultContext() {
    if (this.route && this.route.options.contextKey) {
      this.route.queryParams.subscribe(params => {
        const contextParam = params[this.route.options.contextKey as string];
        if (contextParam) {
          this.options.defaultContextUri = contextParam;
        }
        this.loadContext(this.options.defaultContextUri);
      });
    } else {
      this.loadContext(this.options.defaultContextUri);
    }
  }

  loadContext(uri: string) {
    const context = this.context$.value;

    if (context && context.uri === uri) { return; }

    let url: string;
    if (this.options.url) {
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
      url = `${this.options.url}contexts/${id}/details`;
    } else {
      url = this.getPath(`${uri}.json`);
    }

    this.requestService.register(
      this.authHttp.get(url)
        .map(res => res.json())
        .catch(res => this.handleError(res, uri))
    , 'Context')
    .subscribe((_context: DetailedContext) => {
      this.setContext(_context);
    });
  }

  setContext(context: DetailedContext) {
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
      .instant('igo.contextInvalid.title');

    const textError = this.languageService.translate
      .instant('igo.contextInvalid.text', {value: titleContext});

    throw [{title: titleError, text: textError}];
  }

}

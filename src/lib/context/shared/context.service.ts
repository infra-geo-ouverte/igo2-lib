import { Injectable, Optional } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { RequestService, ConfigService, Message, RouteService } from '../../core';
// Import from shared to avoid circular dependencies
import { ToolService } from '../../tool/shared';

import { Context, ContextServiceOptions,
         DetailedContext, ContextMapView } from './context.interface';

@Injectable()
export class ContextService {

  public context$ = new BehaviorSubject<DetailedContext>(undefined);
  public contexts$ = new BehaviorSubject<Context[]>([]);
  private defaultContextUri: string = '_default';
  private mapViewFromRoute: ContextMapView = {};
  private options: ContextServiceOptions;

  constructor(private http: Http,
              private requestService: RequestService,
              private toolService: ToolService,
              private config: ConfigService,
              @Optional() private route: RouteService) {

    this.options = Object.assign({
      basePath: 'contexts',
      contextListFile: '_contexts.json'
    }, this.config.getConfig('context'));

    this.readParamsFromRoute();
  }

  loadContexts() {
    this.requestService.register(
      this.http.get(this.getPath(this.options.contextListFile)))
        .map(res => res.json())
        .subscribe(contexts => {
          this.contexts$.next(contexts);
        });
  }

  loadDefaultContext() {
    if (this.route && this.route.options.contextKey) {
      this.route.queryParams.subscribe(params => {
        const contextParam = params[this.route.options.contextKey as string];
        if (contextParam) {
          this.defaultContextUri = contextParam;
        }
        this.loadContext(this.defaultContextUri);
      });
    } else {
      this.loadContext(this.defaultContextUri);
    }
  }

  loadContext(uri: string) {
    const context = this.context$.value;
    if (context && context.uri === uri) { return; }

    this.requestService.register(
      this.http.get(this.getPath(`${uri}.json`))
        .map(res => res.json())
        .catch(res => this.handleError(res))
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

  private handleError(res: Response): Message[] {
    throw [{text: 'Invalid context'}];
  }

}

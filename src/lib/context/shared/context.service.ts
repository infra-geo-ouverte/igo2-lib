import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { RequestService } from '../../core';
// Import from shared to avoid circular dependencies
import { ToolService } from '../../tool/shared';

import { Context, ContextServiceOptions,
         DetailedContext, ContextMapView } from './context.interface';


export let CONTEXT_SERVICE_OPTIONS =
  new InjectionToken<ContextServiceOptions>('contextServiceOptions');

export function provideContextServiceOptions(options: ContextServiceOptions) {
  return {
    provide: CONTEXT_SERVICE_OPTIONS,
    useValue: options
  };
}

@Injectable()
export class ContextService {

  public context$ = new BehaviorSubject<DetailedContext>(undefined);
  public contexts$ = new BehaviorSubject<Context[]>([]);
  private defaultContextUri: string = '_default';
  private mapViewFromRoute: ContextMapView = {};

  constructor(private route: ActivatedRoute,
              private http: Http,
              private requestService: RequestService,
              private toolService: ToolService,
              @Inject(CONTEXT_SERVICE_OPTIONS)
              private options: ContextServiceOptions) {

    this.readQueryParamsRoute();
  }

  loadContexts() {
    this.requestService.register(
      this.http.get(this.getPath(this.options.contextListFile)))
        .map(res => res.json())
        .subscribe(contexts => {
          this.contexts$.next(contexts)
        });
  }


  loadDefaultContext() {
    this.route.queryParams.subscribe(params => {
      this.loadContext(this.defaultContextUri);
    });
  }

  loadContext(uri: string) {
    const context = this.context$.value;
    if (context && context.uri === uri) { return; }

    this.requestService.register(
      this.http.get(this.getPath(`${uri}.json`)), 'Context')
        .map(res => res.json())
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

  private readQueryParamsRoute() {
    this.route.queryParams
      .subscribe(params => {
        if (params['context']) {
          this.defaultContextUri = params['context'];
        }

        if (params['center']) {
          this.mapViewFromRoute.center = params['center'].split(',').map(Number);
        }

        if (params['projection']) {
          this.mapViewFromRoute.projection = params['projection'];
        }

        if (params['zoom']) {
          this.mapViewFromRoute.zoom = Number(params['zoom']);
        }
      });
  }

  private getPath(file: string) {
    const basePath = this.options.basePath.replace(/\/$/, '');

    return `${basePath}/${file}`;
  }

}

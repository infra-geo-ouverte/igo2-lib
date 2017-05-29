import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Http } from '@angular/http';
import { ActivatedRoute } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { RequestService } from '../../core';
// Import from shared to avoid circular dependencies
import { ToolService } from '../../tool/shared';

import { Context, ContextServiceOptions,
         DetailedContext } from './context.interface';


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
  private defaultContextUri = '_default';

  constructor(private route: ActivatedRoute,
              private http: Http,
              private requestService: RequestService,
              private toolService: ToolService,
              @Inject(CONTEXT_SERVICE_OPTIONS)
              private options: ContextServiceOptions) {}

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
      let contextUri = params['context'] || this.defaultContextUri;
      this.loadContext(contextUri);
    });
  }

  loadContext(uri: string) {
    const context = this.context$.value;
    if (context && context.uri === uri) { return; }

    this.requestService.register(
      this.http.get(this.getPath(`${uri}.json`)), 'Context')
        .map(res => res.json())
        .subscribe((_context: DetailedContext) => {
          this.updateContextWithQueryParams(_context);
        });
  }

  setContext(context: DetailedContext) {
    // Update the tools options with those found in the context
    if (context.tools !== undefined) {
      this.toolService.setTools(context.tools);
    }

    this.context$.next(context);
  }

  private updateContextWithQueryParams(context: DetailedContext) {
    return this.route.queryParams
      .subscribe(params => {
        if (!context.map) {
          context.map = {view: {}};
        }

        if (params['center']) {
          context.map.view.center = params['center'].split(',').map(Number);
        }

        if (params['projection']) {
          context.map.view.projection = params['projection'];
        }

        if (params['zoom']) {
          context.map.view.zoom = Number(params['zoom']);
        }

        this.setContext(context);
      });
  }

  private getPath(file: string) {
    const basePath = this.options.basePath.replace(/\/$/, '');

    return `${basePath}/${file}`;
  }

}

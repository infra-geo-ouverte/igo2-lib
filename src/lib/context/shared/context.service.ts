import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Http } from '@angular/http';
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

  constructor(private http: Http,
              private requestService: RequestService,
              private toolService: ToolService,
              @Inject(CONTEXT_SERVICE_OPTIONS)
              private options: ContextServiceOptions) {}

  loadContexts() {
    this.requestService.register(
      this.http.get(this.getPath(this.options.contextListFile)))
        .map(res => res.json())
        .subscribe(contexts => this.contexts$.next(contexts));
  }

  loadContext(uri: string) {
    const context = this.context$.value;
    if (context && context.uri === uri) { return; }

    this.requestService.register(
      this.http.get(this.getPath(`${uri}.json`)), 'Context')
        .map(res => res.json())
        .subscribe(_context => this.setContext(_context));
  }

  setContext(context: DetailedContext) {
    // Update the tools options with those found in the context
    if (context.tools !== undefined) {
      this.toolService.setTools(context.tools);
    }

    this.context$.next(context);
  }

  private getPath(file: string) {
    const basePath = this.options.basePath.replace(/\/$/, '');

    return `${basePath}/${file}`;
  }

}

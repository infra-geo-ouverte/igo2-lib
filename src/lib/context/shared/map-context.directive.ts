import { Directive, Self, OnInit, OnDestroy,  } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IgoMap, MapBrowserComponent, MapViewOptions } from '../../map';

import { ContextService } from './context.service';
import { DetailedContext } from './context.interface';


@Directive({
  selector: '[igoMapContext]'
})
export class MapContextDirective implements OnInit, OnDestroy {

  private component: MapBrowserComponent;
  private context$$: Subscription;

  get map(): IgoMap {
    return this.component.map;
  }

  constructor(@Self() component: MapBrowserComponent,
              private contextService: ContextService) {
    this.component = component;
  }

  ngOnInit() {
    this.context$$ = this.contextService.context$
      .filter(context => context !== undefined)
      .subscribe(context => this.handleContextChange(context));
  }

  ngOnDestroy() {
    this.context$$.unsubscribe();
  }

  private handleContextChange(context: DetailedContext) {
    if (context.map === undefined) { return; }

    const viewOptions: MapViewOptions = context.map.view;
    this.component.view = viewOptions;
  }

}

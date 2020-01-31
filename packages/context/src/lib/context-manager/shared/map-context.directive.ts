import { Directive, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { IgoMap, MapViewOptions, MapBrowserComponent } from '@igo2/geo';

import { ContextService } from './context.service';
import { DetailedContext, ContextMapView } from './context.interface';

@Directive({
  selector: '[igoMapContext]'
})
export class MapContextDirective implements OnInit, OnDestroy {
  private component: MapBrowserComponent;
  private context$$: Subscription;

  get map(): IgoMap {
    return this.component.map;
  }

  constructor(
    component: MapBrowserComponent,
    private contextService: ContextService
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.context$$ = this.contextService.context$
      .pipe(filter(context => context !== undefined))
      .subscribe(context => this.handleContextChange(context));
  }

  ngOnDestroy() {
    this.context$$.unsubscribe();
  }

  private handleContextChange(context: DetailedContext) {
    if (context.map === undefined) {
      return;
    }

    // This creates a new ol.Map when the context changes. Doing that
    // allows the print tool to work properly even when the map's canvas
    // has been tainted (CORS) with the layers of another context. This could
    // have some side effects such as unbinding all listeners on the first map.
    // A better solution would be to create a new map (preview) before
    // printing and avoid the tainted canvas issue. This will come later so
    // this snippet of code is kept here in case it takes too long becomes
    // an issue

    // const target = this.component.map.ol.getTarget();
    // this.component.map.ol.setTarget(undefined);
    // this.component.map.init();
    // this.component.map.ol.setTarget(target);

    const viewContext: ContextMapView = context.map.view;
    if (!this.component.view || viewContext.keepCurrentView !== true) {
      this.component.view = viewContext as MapViewOptions;
    }
  }
}

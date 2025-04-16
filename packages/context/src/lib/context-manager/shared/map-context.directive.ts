import { Directive, OnDestroy, OnInit } from '@angular/core';
import { Params } from '@angular/router';

import { MediaService } from '@igo2/core/media';
import {
  MapBrowserComponent,
  MapControlsOptions,
  MapScaleLineOptions,
  MapViewOptions
} from '@igo2/geo';
import type { IgoMap } from '@igo2/geo';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ShareMapService } from '../../share-map/shared/share-map.service';
import { ContextMapView, DetailedContext } from './context.interface';
import { ContextService } from './context.service';

@Directive({
  selector: '[igoMapContext]',
  standalone: true
})
export class MapContextDirective implements OnInit, OnDestroy {
  private component: MapBrowserComponent;
  private context$$: Subscription;

  get map(): IgoMap {
    return this.component.map;
  }

  private params: Params;

  constructor(
    component: MapBrowserComponent,
    private contextService: ContextService,
    private mediaService: MediaService,
    private shareMapService: ShareMapService
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.context$$ = this.contextService.context$
      .pipe(filter((context) => context !== undefined))
      .subscribe((context) => this.handleContextChange(context));
    this.shareMapService.routeService.queryParams.subscribe((params) => {
      this.params = params;
    });
  }

  ngOnDestroy() {
    this.context$$.unsubscribe();
  }

  private handleContextChange(context: DetailedContext) {
    if (context.map === undefined) {
      return;
    }

    const viewContext: ContextMapView = context.map.view;
    const shouldOverrideView =
      !this.component.view ||
      viewContext.keepCurrentView !== true ||
      context.map.view.projection !== this.map.projection;

    if (
      this.shareMapService.hasPositionParams(this.params) &&
      shouldOverrideView
    ) {
      const positions = this.shareMapService.parser.parsePosition(this.params);
      this.component.view = { ...viewContext, ...positions };
    } else if (shouldOverrideView) {
      this.component.view = viewContext as MapViewOptions;
    }

    if (this.component.map.geolocationController) {
      this.component.map.geolocationController.updateGeolocationOptions(
        viewContext
      );
    }

    const controlsContext: MapControlsOptions = context.map.controls;
    if (!this.component.controls && controlsContext) {
      if (this.mediaService.isMobile()) {
        if (typeof controlsContext.scaleLine !== 'boolean') {
          const scaleLineOption =
            controlsContext.scaleLine as MapScaleLineOptions;
          if (!scaleLineOption.minWidth) {
            scaleLineOption.minWidth = Math.min(64, scaleLineOption.minWidth);
            controlsContext.scaleLine = scaleLineOption;
          }
        }
      }
      this.component.controls = controlsContext;
    }
  }
}

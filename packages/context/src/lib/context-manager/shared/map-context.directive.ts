import { Directive, OnDestroy, OnInit, inject } from '@angular/core';
import { Params } from '@angular/router';

import { MediaService } from '@igo2/core/media';
import {
  MapBrowserComponent,
  MapControlsOptions,
  MapScaleLineOptions
} from '@igo2/geo';
import type { IgoMap } from '@igo2/geo';

import { Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { ShareMapService } from '../../share-map/shared/share-map.service';
import { ContextMapView, DetailedContext } from './context.interface';
import { ContextService } from './context.service';

@Directive({
  selector: '[igoMapContext]'
})
export class MapContextDirective implements OnInit, OnDestroy {
  private contextService = inject(ContextService);
  private mediaService = inject(MediaService);
  private shareMapService = inject(ShareMapService);

  private component: MapBrowserComponent;
  private context$$: Subscription;

  get map(): IgoMap {
    return this.component.map();
  }

  private queryParams: Params;

  constructor() {
    const component = inject(MapBrowserComponent);

    this.component = component;
  }

  ngOnInit() {
    this.context$$ = this.shareMapService.routeService.queryParams
      .pipe(
        switchMap((params) => {
          this.queryParams = params ?? {};
          return this.contextService.context$.pipe(
            filter((context) => context !== undefined)
          );
        })
      )
      .subscribe((context) => this.handleContextChange(context));
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
      !this.component.view() ||
      viewContext.keepCurrentView !== true ||
      context.map.view.projection !== this.map.projection;

    if (
      this.shareMapService.hasPositionParams(this.queryParams) &&
      shouldOverrideView
    ) {
      const positions = this.shareMapService.parser.parsePosition(
        this.queryParams
      );
      this.component.setView({ ...viewContext, ...positions });
    } else if (shouldOverrideView) {
      this.component.setView(viewContext);
    }

    const map = this.component.map();
    if (map.geolocationController) {
      map.geolocationController.updateGeolocationOptions(viewContext);
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

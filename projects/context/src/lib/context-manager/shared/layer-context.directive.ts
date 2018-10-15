import { Directive, OnInit, OnDestroy, Optional } from '@angular/core';

import { Subscription } from 'rxjs';
import { skip, filter } from 'rxjs/operators';

import { RouteService } from '@igo2/core';
import {
  IgoMap,
  MapBrowserComponent,
  DataSourceService,
  LayerService,
  LayerOptions
} from '@igo2/geo';

import { ContextService } from './context.service';
import { DetailedContext } from './context.interface';

@Directive({
  selector: '[igoLayerContext]'
})
export class LayerContextDirective implements OnInit, OnDestroy {
  private context$$: Subscription;
  private queryParams: any;

  get map(): IgoMap {
    return this.component.map;
  }

  constructor(
    private component: MapBrowserComponent,
    private contextService: ContextService,
    private layerService: LayerService,
    @Optional() private route: RouteService
  ) {}

  ngOnInit() {
    this.context$$ = this.contextService.context$
      .pipe(filter(context => context !== undefined))
      .subscribe(context => this.handleContextChange(context));

    if (
      this.route &&
      this.route.options.visibleOnLayersKey &&
      this.route.options.visibleOffLayersKey &&
      this.route.options.contextKey
    ) {
      const queryParams$$ = this.route.queryParams
        .pipe(skip(1))
        .subscribe(params => {
          this.queryParams = params;
          queryParams$$.unsubscribe();
        });
    }
  }

  ngOnDestroy() {
    this.context$$.unsubscribe();
  }

  private handleContextChange(context: DetailedContext) {
    if (context.layers === undefined) {
      return;
    }

    this.map.removeLayers();

    context.layers.forEach(contextLayer => {
      this.addLayerToMap(contextLayer);
    });
  }

  private addLayerToMap(layerOptions: LayerOptions) {
    // if (contextLayer.maxScaleDenom) {
    //   contextLayer.maxResolution = this.getResolutionFromScale(
    //     contextLayer.maxScaleDenom
    //   );
    // }
    // if (contextLayer.minScaleDenom) {
    //   contextLayer.minResolution = this.getResolutionFromScale(
    //     contextLayer.minScaleDenom
    //   );
    // }

    this.layerService
      .createAsyncLayer(layerOptions)
      .subscribe(layer => {
        this.getLayerParamVisibilityUrl(
          layer.id,
          layer
        );

        this.map.addLayer(layer);
      });
  }

  public getResolutionFromScale(scale: number): number {
    const dpi = 25.4 / 0.28;
    return scale / (39.37 * dpi);
  }

  private getLayerParamVisibilityUrl(id, layer) {
    const params = this.queryParams;
    const current_context = this.contextService.context$.value['uri'];
    const current_layerid: string = id;

    if (!params || !current_layerid) {
      return;
    }

    const contextParams = params[this.route.options.contextKey as string];
    if (contextParams === current_context || !contextParams) {
      let visibleOnLayersParams = '';
      let visibleOffLayersParams = '';
      let visiblelayers: string[] = [];
      let invisiblelayers: string[] = [];

      if (
        this.route.options.visibleOnLayersKey &&
        params[this.route.options.visibleOnLayersKey as string]
      ) {
        visibleOnLayersParams =
          params[this.route.options.visibleOnLayersKey as string];
      }
      if (
        this.route.options.visibleOffLayersKey &&
        params[this.route.options.visibleOffLayersKey as string]
      ) {
        visibleOffLayersParams =
          params[this.route.options.visibleOffLayersKey as string];
      }

      /* This order is important because to control whichever
       the order of * param. First whe open and close everything.*/
      if (visibleOnLayersParams === '*') {
        layer.visible = true;
      }
      if (visibleOffLayersParams === '*') {
        layer.visible = false;
      }

      // After, managing named layer by id (context.json OR id from datasource)
      visiblelayers = visibleOnLayersParams.split(',');
      invisiblelayers = visibleOffLayersParams.split(',');
      if (visiblelayers.indexOf(current_layerid) > -1) {
        layer.visible = true;
      }
      if (invisiblelayers.indexOf(current_layerid) > -1) {
        layer.visible = false;
      }
    }
  }
}

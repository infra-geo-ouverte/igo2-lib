import { Directive, OnInit, OnDestroy, Optional, Input } from '@angular/core';

import { Subscription, of, zip } from 'rxjs';
import { withLatestFrom, skip, filter } from 'rxjs/operators';

import { RouteService } from '@igo2/core';
import {
  IgoMap,
  MapBrowserComponent,
  Layer,
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

  private contextLayers: Layer[] = [];

  @Input() removeLayersOnContextChange: boolean = true;

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
    if (context.layers === undefined) { return; }
    if (this.removeLayersOnContextChange === true) {
      this.map.removeAllLayers();
    } else {
      this.map.removeLayers(this.contextLayers);
    }
    this.contextLayers = [];

    const layersAndIndex$ = zip(...context.layers.map((layerOptions: LayerOptions, index: number) => {
      return this.layerService.createAsyncLayer(layerOptions).pipe(
        withLatestFrom(of(index))
      );
    }));

    layersAndIndex$.subscribe((layersAndIndex: [Layer, number][]) => {
      const layers = layersAndIndex
        .reduce((acc: Layer[], bunch: [Layer, number]) => {
          const [layer, index] = bunch;
          // A layer may be undefined when it's badly configured
          if (layer !== undefined) {
            layer.visible = this.computeLayerVisibilityFromUrl(layer);
            layer.zIndex = layer.zIndex || index + 1;  // Map indexes start at 1
          }

          acc[index] = layer;
          return acc;
        }, new Array(layersAndIndex.length))
        .filter((layer: Layer) => layer !== undefined);

      this.contextLayers = layers;
      this.map.addLayers(layers);
    });
  }

  private computeLayerVisibilityFromUrl(layer: Layer): boolean {
    const params = this.queryParams;
    const currentContext = this.contextService.context$.value.uri;
    const currentLayerid: string = layer.id;

    let visible = layer.visible;
    if (!params || !currentLayerid) {
      return visible;
    }

    const contextParams = params[this.route.options.contextKey as string];
    if (contextParams === currentContext || !contextParams) {
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
        visible = true;
      }
      if (visibleOffLayersParams === '*') {
        visible = false;
      }

      // After, managing named layer by id (context.json OR id from datasource)
      visiblelayers = visibleOnLayersParams.split(',');
      invisiblelayers = visibleOffLayersParams.split(',');
      if (visiblelayers.indexOf(currentLayerid) > -1) {
        visible = true;
      }
      if (invisiblelayers.indexOf(currentLayerid) > -1) {
        visible = false;
      }
    }

    return visible;
  }
}

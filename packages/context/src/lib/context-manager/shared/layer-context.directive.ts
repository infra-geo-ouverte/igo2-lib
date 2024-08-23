import { Directive, Input, OnDestroy, OnInit, Optional } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { RouteService } from '@igo2/core/route';
import {
  Layer,
  LayerOptions,
  LayerService,
  MapBrowserComponent,
  StyleListService,
  StyleService
} from '@igo2/geo';
import type { IgoMap } from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';

import { Subscription, merge } from 'rxjs';
import { buffer, debounceTime, filter, first } from 'rxjs/operators';

import {
  addImportedFeaturesStyledToMap,
  addImportedFeaturesToMap
} from '../../context-import-export/shared/context-import.utils';
import { DetailedContext } from './context.interface';
import { ContextService } from './context.service';

@Directive({
  selector: '[igoLayerContext]',
  standalone: true
})
export class LayerContextDirective implements OnInit, OnDestroy {
  private context$$: Subscription;
  private queryParams: any;

  private contextLayers: Layer[] = [];

  @Input() removeLayersOnContextChange = true;

  get map(): IgoMap {
    return this.component.map;
  }

  constructor(
    private component: MapBrowserComponent,
    private contextService: ContextService,
    private layerService: LayerService,
    private configService: ConfigService,
    private styleListService: StyleListService,
    private styleService: StyleService,
    @Optional() private route: RouteService
  ) {}

  ngOnInit() {
    this.context$$ = this.contextService.context$
      .pipe(filter((context) => context !== undefined))
      .subscribe((context) => this.handleContextChange(context));

    if (
      this.route &&
      this.route.options.visibleOnLayersKey &&
      this.route.options.visibleOffLayersKey &&
      this.route.options.contextKey
    ) {
      this.route.queryParams
        .pipe(first((params) => !ObjectUtils.isEmpty(params)))
        .subscribe((params) => {
          this.queryParams = params;
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
    if (this.removeLayersOnContextChange === true) {
      this.map.removeAllLayers();
    } else {
      this.map.removeLayers(this.contextLayers);
    }
    this.contextLayers = [];

    const layersAndIndex$ = merge(
      ...context.layers.map((layerOptions: LayerOptions) => {
        return this.layerService.createAsyncLayer(layerOptions, context.uri);
      })
    );

    layersAndIndex$
      .pipe(buffer(layersAndIndex$.pipe(debounceTime(500))))
      .subscribe((layers: Layer[]) => {
        this.handleAddLayers(layers);

        if (context.extraFeatures) {
          context.extraFeatures.forEach((featureCollection) => {
            const importExportOptions =
              this.configService.getConfig('importExport');
            if (!importExportOptions?.importWithStyle) {
              addImportedFeaturesToMap(featureCollection, this.map);
            } else {
              addImportedFeaturesStyledToMap(
                featureCollection,
                this.map,
                this.styleListService,
                this.styleService
              );
            }
          });
        }
      });

    this.layerService
      .createAsyncIdbLayers(context.uri)
      .pipe(debounceTime(500))
      .subscribe((layers: Layer[]) => this.handleAddLayers(layers));
  }

  private handleAddLayers(layers: Layer[]) {
    layers = layers
      .filter((layer: Layer) => layer !== undefined)
      .map((layer) => {
        layer.visible = this.computeLayerVisibilityFromUrl(layer);

        return layer;
      });
    this.contextLayers.concat(layers);
    this.map.addLayers(layers);
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
      if (
        visiblelayers.indexOf(currentLayerid) > -1 ||
        visiblelayers.indexOf(currentLayerid.toString()) > -1
      ) {
        visible = true;
      }
      if (
        invisiblelayers.indexOf(currentLayerid) > -1 ||
        invisiblelayers.indexOf(currentLayerid.toString()) > -1
      ) {
        visible = false;
      }
    }

    return visible;
  }
}

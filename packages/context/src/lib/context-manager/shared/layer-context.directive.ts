import { Directive, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { Params } from '@angular/router';

import { ConfigService } from '@igo2/core/config';
import { RouteService } from '@igo2/core/route';
import {
  LayerService,
  MapBrowserComponent,
  StyleListService,
  StyleService,
  isLayerGroupOptions,
  sortLayersByZindex
} from '@igo2/geo';
import type { AnyLayer, AnyLayerOptions, IgoMap } from '@igo2/geo';
import { ObjectUtils } from '@igo2/utils';

import { Subscription } from 'rxjs';
import { debounceTime, filter, first } from 'rxjs/operators';

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
  private queryParams: Params;

  private contextLayers: AnyLayer[] = [];

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
      this.map.layerController.reset();
    } else {
      this.map.layerController.remove(...this.contextLayers);
    }
    this.contextLayers = [];
    this.layerService.unavailableLayers = [];

    const importExportOptions = this.configService.getConfig('importExport');

    this.layerService
      .createLayers(context.layers, context.uri)
      .subscribe((layers) => {
        this.handleAddLayers(layers);

        if (context.extraFeatures) {
          context.extraFeatures.forEach((featureCollection) => {
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

    if (this.configService.getConfig('offline')?.enable) {
      this.layerService
        .createAsyncIdbLayers(context.uri)
        .pipe(debounceTime(500))
        .subscribe((layers) => this.handleAddLayers(layers));
    }
  }

  private getFlattenOptions(options: AnyLayerOptions[]): AnyLayerOptions[] {
    return options.reduce((accumulator, option) => {
      if (isLayerGroupOptions(option)) {
        const children = option.children
          ? this.getFlattenOptions(option.children)
          : [];
        accumulator.push(option, ...children);
      } else {
        accumulator.push(option);
      }
      return accumulator;
    }, []);
  }

  private handleAddLayers(layers: (AnyLayer | undefined)[]) {
    const layersFiltrered = layers
      .filter((layer) => layer)
      .map((layer) => {
        layer.visible = this.computeLayerVisibilityFromUrl(layer);
        return layer;
      });

    const layersSorted = sortLayersByZindex(layersFiltrered, 'asc');
    this.contextLayers.concat(layersSorted);
    this.map.layerController.add(...layersSorted);
  }

  private computeLayerVisibilityFromUrl(layer: AnyLayer): boolean {
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

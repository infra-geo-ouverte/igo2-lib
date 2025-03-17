import { Directive, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { Params } from '@angular/router';

import { ConfigService } from '@igo2/core/config';
import { RouteService } from '@igo2/core/route';
import {
  LayerService,
  MapBrowserComponent,
  StyleListService,
  StyleService,
  mergeLayersOptions,
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
import { ShareMapService } from '../../share-map/shared/share-map.service';
import {
  hasLegacyParams,
  hasModernShareParams
} from '../../share-map/shared/share-map.utils';
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
    private shareMapService: ShareMapService,
    @Optional() private route: RouteService
  ) {}

  ngOnInit() {
    this.context$$ = this.contextService.context$
      .pipe(filter((context) => context !== undefined))
      .subscribe((context) => this.handleContextChange(context));

    if (this.route) {
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

    const contextLayers = this.handleContextWithSharedUrl(
      ObjectUtils.copyDeep(context)
    );

    if (this.removeLayersOnContextChange === true) {
      this.map.layerController.reset();
    } else {
      this.map.layerController.remove(...this.contextLayers);
    }
    this.contextLayers = [];
    this.layerService.unavailableLayers = [];

    const importExportOptions = this.configService.getConfig('importExport');

    this.layerService
      .createLayers(contextLayers, context.uri)
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
    const contextParams = this.shareMapService.getContext(params);

    if (contextParams === currentContext || !contextParams) {
      let visibleOnLayersParams = '';
      let visibleOffLayersParams = '';
      let visiblelayers: string[] = [];
      let invisiblelayers: string[] = [];
      const visibleOnLayers =
        params[this.shareMapService.optionsLegacy.visibleOnLayersKey];

      const visibleOffLayers =
        params[this.shareMapService.optionsLegacy.visibleOffLayersKey];

      if (visibleOnLayers) {
        visibleOnLayersParams = visibleOnLayers;
      }
      if (visibleOffLayers) {
        visibleOffLayersParams = visibleOffLayers;
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

  private handleContextWithSharedUrl(
    context: DetailedContext
  ): AnyLayerOptions[] {
    if (
      !this.queryParams ||
      (!hasLegacyParams(this.queryParams, this.shareMapService.optionsLegacy) &&
        !hasModernShareParams(
          this.queryParams,
          this.shareMapService.keysDefinitions
        ))
    ) {
      return context.layers;
    }

    const { layers, uri } = context;
    const contextValue = this.shareMapService.getContext(this.queryParams);

    if (!contextValue || contextValue === uri) {
      const layersOptions = this.shareMapService.parser.parseLayers(
        this.queryParams
      );
      if (layersOptions.length) {
        return mergeLayersOptions([...layers], layersOptions);
      }
    }
    return layers;
  }
}

import { ConfigService, StorageService } from '@igo2/core';
import { SubjectStatus } from '@igo2/utils';

import olMap from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import olView, { ViewOptions } from 'ol/View';
import olControlAttribution from 'ol/control/Attribution';
import olControlScaleLine from 'ol/control/ScaleLine';
import * as olinteraction from 'ol/interaction';
import olLayer from 'ol/layer/Layer';
import * as olproj from 'ol/proj';
import OlProjection from 'ol/proj/Projection';
import * as olproj4 from 'ol/proj/proj4';
import olSource from 'ol/source/Source';
import { getUid } from 'ol/util';

import proj4 from 'proj4';
import { BehaviorSubject, Subject, pairwise, skipWhile } from 'rxjs';

import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { Layer, VectorLayer } from '../../layer/shared/layers';
import { Overlay } from '../../overlay/shared/overlay';
import { LayerWatcher } from '../utils/layer-watcher';
import { MapGeolocationController } from './controllers/geolocation';
import { MapViewController } from './controllers/view';
import {
  getAllChildLayersByDeletion,
  getRootParentByDeletion,
  handleLayerPropertyChange,
  initLayerSyncFromRootParentLayers
} from './linkedLayers.utils';
import type { MapBase } from './map.abstract';
import {
  MapAttributionOptions,
  MapControlsOptions,
  MapExtent,
  MapOptions,
  MapScaleLineOptions,
  MapViewOptions
} from './map.interface';

// TODO: This class is messy. Clearly define it's scope and the map browser's.
// Move some stuff into controllers.
export class IgoMap implements MapBase {
  public ol: olMap;
  public forcedOffline$ = new BehaviorSubject<boolean>(false);
  public layers$ = new BehaviorSubject<Layer[]>([]);
  public layersAddedByClick$ = new BehaviorSubject<Layer[]>(undefined);
  public status$: Subject<SubjectStatus>;
  public propertyChange$: Subject<{ event: ObjectEvent; layer: Layer }>;
  public overlay: Overlay;
  public queryResultsOverlay: Overlay;
  public searchResultsOverlay: Overlay;
  public viewController: MapViewController;
  public geolocationController: MapGeolocationController;
  public swipeEnabled$ = new BehaviorSubject<boolean>(false);
  public mapCenter$ = new BehaviorSubject<boolean>(false);
  public selectedFeatures$ = new BehaviorSubject<Layer[]>(null);

  public bufferDataSource: FeatureDataSource;

  private layerWatcher: LayerWatcher;
  private options: MapOptions;
  private mapViewOptions: MapViewOptions;
  private defaultOptions: Partial<MapOptions> = {
    controls: { attribution: false }
  };

  get layers(): Layer[] {
    return this.layers$.value;
  }

  /** @deprecated use projectionCode */
  get projection(): string {
    return this.projectionCode;
  }

  get viewProjection(): olproj.Projection {
    return this.viewController.getOlProjection();
  }

  get projectionCode(): string {
    return this.viewProjection.getCode();
  }

  constructor(
    options?: MapOptions,
    private storageService?: StorageService,
    private configService?: ConfigService
  ) {
    this.options = Object.assign({}, this.defaultOptions, options);
    this.layerWatcher = new LayerWatcher();
    this.status$ = this.layerWatcher.status$;
    this.propertyChange$ = this.layerWatcher.propertyChange$;
    olproj4.register(proj4);
    this.init();
  }

  init() {
    const controls = [];
    if (this.options.controls) {
      if (this.options.controls.attribution) {
        const attributionOpt = (
          this.options.controls.attribution === true
            ? {}
            : this.options.controls.attribution
        ) as MapAttributionOptions;
        controls.push(new olControlAttribution(attributionOpt));
      }
      if (this.options.controls.scaleLine) {
        const scaleLineOpt = (
          this.options.controls.scaleLine === true
            ? {}
            : this.options.controls.scaleLine
        ) as MapScaleLineOptions;
        controls.push(new olControlScaleLine(scaleLineOpt));
      }
    }
    let interactions = {};
    if (this.options.interactions === false) {
      interactions = {
        altShiftDragRotate: false,
        doubleClickZoom: false,
        keyboard: false,
        mouseWheelZoom: false,
        shiftDragZoom: false,
        dragPan: false,
        pinchRotate: false,
        pinchZoom: false
      };
    }

    this.ol = new olMap({
      interactions: olinteraction.defaults(interactions),
      controls
    });

    this.setView(this.options.view || {});
    this.viewController = new MapViewController({
      stateHistory: true
    });
    this.viewController.setOlMap(this.ol);
    this.overlay = new Overlay(this);
    this.queryResultsOverlay = new Overlay(this);
    this.searchResultsOverlay = new Overlay(this);
    this.ol.once('rendercomplete', () => {
      this.geolocationController = new MapGeolocationController(
        this,
        {
          projection: this.viewController.getOlProjection()
        },
        this.storageService,
        this.configService
      );
      this.geolocationController.setOlMap(this.ol);
      if (this.geolocationController) {
        this.geolocationController.updateGeolocationOptions(
          this.mapViewOptions
        );
      }
      this.layers$.pipe(pairwise()).subscribe(([prevLayers, currentLayers]) => {
        let prevLayersId;
        if (prevLayers) {
          prevLayersId = prevLayers.map((l) => l.id);
        }
        const layers = currentLayers.filter(
          (l) => !prevLayersId.includes(l.id)
        );

        for (const layer of layers) {
          if (layer.options.linkedLayers) {
            layer.ol.once('postrender', () => {
              initLayerSyncFromRootParentLayers(this, layers);
            });
          }
        }
      });
      this.viewController.monitorRotation();
    });
    this.propertyChange$
      .pipe(skipWhile((pc) => !pc))
      .subscribe((p) => handleLayerPropertyChange(this, p.event, p.layer));
  }

  setTarget(id: string) {
    this.ol.setTarget(id);
    if (id !== undefined) {
      this.layerWatcher.subscribe(() => {}, null);
    } else {
      this.layerWatcher.unsubscribe();
    }
  }

  updateView(options: MapViewOptions) {
    const currentView = this.ol.getView();
    const viewOptions: MapViewOptions = {
      ...currentView.getProperties(),
      ...options
    };

    if (options.zoom && options.resolution == null) {
      viewOptions.resolution = undefined;
    }

    this.setView(viewOptions);
    if (options.maxZoomOnExtent) {
      this.viewController.maxZoomOnExtent = options.maxZoomOnExtent;
    }
    this.mapViewOptions = options;
  }

  /**
   * Set the map view
   * @param options Map view options
   */
  setView(options: MapViewOptions) {
    if (this.viewController !== undefined) {
      this.viewController.clearStateHistory();
    }

    const viewOptions: ViewOptions = { constrainResolution: true, ...options };
    if (options.center) {
      viewOptions.center = olproj.fromLonLat(
        options.center,
        options.projection
      );
    }

    this.ol.setView(new olView(viewOptions));

    if (options.maxLayerZoomExtent) {
      this.viewController.maxLayerZoomExtent = options.maxLayerZoomExtent;
    }
  }

  updateControls(value: MapControlsOptions) {
    if (value === undefined) {
      return;
    }

    const controls = [];
    if (value.attribution) {
      const attributionOpt = (
        value.attribution === true ? {} : value.attribution
      ) as MapAttributionOptions;
      controls.push(new olControlAttribution(attributionOpt));
    }
    if (value.scaleLine) {
      const scaleLineOpt = (
        value.scaleLine === true ? {} : value.scaleLine
      ) as MapScaleLineOptions;
      controls.push(new olControlScaleLine(scaleLineOpt));
    }

    const currentControls = Object.assign([], this.ol.getControls().getArray());
    currentControls.forEach((control) => {
      this.ol.removeControl(control);
    });
    controls.forEach((control) => {
      this.ol.addControl(control);
    });
  }

  /**
   * @deprecated
   * TODO: Move to ViewController and update every place it's used
   */
  getCenter(projection?: string | OlProjection): [number, number] {
    return this.viewController.getCenter(projection);
  }

  /**
   * @deprecated
   * TODO: Move to ViewController and update every place it's used
   */
  getExtent(projection?: string | OlProjection): MapExtent {
    return this.viewController.getExtent(projection);
  }
  /**
   * @deprecated
   * TODO: Move to ViewController and update every place it's used
   */
  getZoom(): number {
    return this.viewController.getZoom();
  }

  changeBaseLayer(baseLayer: Layer) {
    if (!baseLayer) {
      return;
    }

    for (const bl of this.getBaseLayers()) {
      bl.visible = false;
    }

    baseLayer.visible = true;

    this.viewController.olView.setMinZoom(
      baseLayer.dataSource.options.minZoom || (this.options.view || {}).minZoom
    );
    this.viewController.olView.setMaxZoom(
      baseLayer.dataSource.options.maxZoom || (this.options.view || {}).maxZoom
    );
  }

  getBaseLayers(): Layer[] {
    return this.layers.filter((layer: Layer) => layer.baseLayer === true);
  }

  getLayerById(id: string): Layer {
    return this.layers.find((layer: Layer) => layer.id && layer.id === id);
  }

  getLayerByAlias(alias: string): Layer {
    return this.layers.find(
      (layer: Layer) => layer.alias && layer.alias === alias
    );
  }

  getLayerByOlUId(olUId: string): Layer {
    return this.layers.find(
      (layer: Layer) => getUid(layer.ol) && getUid(layer.ol) === olUId
    );
  }

  getLayerByOlLayer(olLayer: olLayer<olSource>): Layer {
    const olUId = getUid(olLayer);
    return this.getLayerByOlUId(olUId);
  }

  /**
   * Add a single layer
   * @param layer Layer to add
   * @param push DEPRECATED
   */
  addLayer(layer: Layer, push = true) {
    this.addLayers([layer]);
  }

  /**
   * Add many layers
   * @param layers Layers to add
   * @param push DEPRECATED
   */
  addLayers(layers: Layer[], push = true) {
    let offsetZIndex = 0;
    let offsetBaseLayerZIndex = 0;
    const addedLayers = layers
      .map((layer: Layer) => {
        if (!layer) {
          return;
        }
        const offset = layer.zIndex
          ? 0
          : layer.baseLayer
            ? offsetBaseLayerZIndex++
            : offsetZIndex++;
        return this.doAddLayer(layer, offset);
      })
      .filter((layer: Layer | undefined) => layer !== undefined);
    this.setLayers([].concat(this.layers, addedLayers));
  }

  /**
   * Remove a single layer
   * @param layer Layer to remove
   */
  removeLayer(layer: Layer) {
    this.removeLayers([layer]);
  }

  /**
   * Remove many layers
   * @param layers Layers to remove
   */
  removeLayers(layers: Layer[]) {
    const newLayers = this.layers$.value.slice(0);
    const layersToRemove = [];
    layers.forEach((layer: Layer) => {
      if (layer instanceof VectorLayer) {
        layer.removeLayerFromIDB();
      }
      const index = newLayers.indexOf(layer);
      if (index >= 0) {
        layersToRemove.push(layer);
        newLayers.splice(index, 1);
        this.handleLinkedLayersDeletion(layer, layersToRemove);
        layersToRemove.map((linkedLayer) => {
          const linkedIndex = newLayers.indexOf(linkedLayer);
          if (linkedIndex >= 0) {
            newLayers.splice(linkedIndex, 1);
          }
        });
      }
    });

    layersToRemove.forEach((layer: Layer) => this.doRemoveLayer(layer));
    this.setLayers(newLayers);
  }

  /**
   * Build a list of linked layers to delete
   * @param srcLayer Layer that has triggered the deletion
   * @param layersToRemove list to append the layer to delete into
   */
  handleLinkedLayersDeletion(srcLayer: Layer, layersToRemove: Layer[]) {
    let rootParentByDeletion = getRootParentByDeletion(this, srcLayer);
    if (!rootParentByDeletion) {
      rootParentByDeletion = srcLayer;
    }
    const clbd = getAllChildLayersByDeletion(this, rootParentByDeletion, [
      rootParentByDeletion
    ]);
    for (const layer of clbd) {
      layersToRemove.push(layer);
    }
  }

  /**
   * Remove all layers
   */
  removeAllLayers() {
    this.layers.forEach((layer: Layer) => this.doRemoveLayer(layer));
    this.layers$.next([]);
  }

  raiseLayer(layer: Layer) {
    const index = this.getLayerIndex(layer);
    if (index > 1) {
      this.moveLayer(layer, index, index - 1);
    }
  }

  raiseLayers(layers: Layer[]) {
    for (const layer of layers) {
      this.raiseLayer(layer);
    }
  }

  lowerLayer(layer: Layer) {
    const index = this.getLayerIndex(layer);
    if (index < this.layers.length - 1) {
      this.moveLayer(layer, index, index + 1);
    }
  }

  lowerLayers(layers: Layer[]) {
    const reverseLayers = layers.reverse();
    for (const layer of reverseLayers) {
      this.lowerLayer(layer);
    }
  }

  moveLayer(layer: Layer, from: number, to: number) {
    const layerTo = this.layers[to];
    const zIndexTo = layerTo.zIndex;
    const zIndexFrom = layer.zIndex;

    if (layerTo.baseLayer || layer.baseLayer) {
      return;
    }

    layer.zIndex = zIndexTo;
    layerTo.zIndex = zIndexFrom;

    this.layers[to] = layer;
    this.layers[from] = layerTo;
    this.layers$.next(this.layers.slice(0));
  }

  /**
   * Add a layer to the OL map and start watching. If the layer is already
   * added to this map, make it visible but don't add it one again.
   * @param layer Layer
   * @returns The layer added, if any
   */
  private doAddLayer(layer: Layer, offsetZIndex: number) {
    if (layer.baseLayer && layer.visible) {
      this.changeBaseLayer(layer);
    }

    const existingLayer = this.getLayerById(layer.id);
    if (existingLayer !== undefined) {
      existingLayer.visible = true;
      return;
    }

    if (!layer.baseLayer && layer.zIndex) {
      layer.zIndex += 10;
    }

    if (layer.zIndex === undefined || layer.zIndex === 0) {
      const maxZIndex = Math.max(
        layer.baseLayer ? 0 : 10,
        ...this.layers
          .filter(
            (l) => l.baseLayer === layer.baseLayer && l.zIndex < 200 // zIndex > 200 = system layer
          )
          .map((l) => l.zIndex)
      );
      layer.zIndex = maxZIndex + 1 + offsetZIndex;
    }

    if (layer.baseLayer && layer.zIndex > 9) {
      layer.zIndex = 10; // baselayer must have zIndex < 10
    }

    layer.setMap(this);
    this.layerWatcher.watchLayer(layer);
    this.ol.addLayer(layer.ol);

    return layer;
  }

  /**
   * Remove a layer from the OL map and stop watching
   * @param layer Layer
   */
  private doRemoveLayer(layer: Layer) {
    this.layerWatcher.unwatchLayer(layer);
    this.ol.removeLayer(layer.ol);
    layer.setMap(undefined);
  }

  /**
   * Update the layers observable
   * @param layers Layers
   */
  private setLayers(layers: Layer[]) {
    this.layers$.next(this.sortLayersByZIndex(layers).slice(0));
  }

  /**
   * Sort layers by descending zIndex
   * @param layers Array of layers
   * @returns The original array, sorted by zIndex
   */
  private sortLayersByZIndex(layers: Layer[]) {
    // Sort by descending zIndex
    return layers.sort(
      (layer1: Layer, layer2: Layer) => layer2.zIndex - layer1.zIndex
    );
  }

  /**
   * Get layer index in the map's inenr array of layers
   * @param layer Layer
   * @returns The layer index
   */
  private getLayerIndex(layer: Layer) {
    return this.layers.findIndex((_layer: Layer) => _layer === layer);
  }
}

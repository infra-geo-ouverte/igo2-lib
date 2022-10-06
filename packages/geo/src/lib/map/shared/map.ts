import olMap from 'ol/Map';
import olView from 'ol/View';
import olControlAttribution from 'ol/control/Attribution';
import olControlScaleLine from 'ol/control/ScaleLine';
import * as olproj from 'ol/proj';
import * as olproj4 from 'ol/proj/proj4';
import OlProjection from 'ol/proj/Projection';
import * as olinteraction from 'ol/interaction';
import {getUid} from 'ol/util';
import olLayer from 'ol/layer/Layer';
import olSource from 'ol/source/Source';

import proj4 from 'proj4';
import { BehaviorSubject, Subject } from 'rxjs';

import { SubjectStatus } from '@igo2/utils';

import { Layer, LinkedProperties } from '../../layer/shared/layers';
import { Overlay } from '../../overlay/shared/overlay';

import { LayerWatcher } from '../utils/layer-watcher';
import {
  MapViewOptions,
  MapOptions,
  MapAttributionOptions,
  MapScaleLineOptions,
  MapExtent,
  MapControlsOptions
} from './map.interface';
import { MapViewController } from './controllers/view';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { MapGeolocationController } from './controllers/geolocation';
import { StorageService, ConfigService } from '@igo2/core';
import { ObjectEvent } from 'ol/Object';
import { getAllChildLayersByProperty, getLinkedLayersOptions, getRootParentByProperty } from './linkedLayers.utils';

// TODO: This class is messy. Clearly define it's scope and the map browser's.
// Move some stuff into controllers.
export class IgoMap {
  public ol: olMap;
  public offlineButtonToggle$ = new BehaviorSubject<boolean>(false);
  public layers$ = new BehaviorSubject<Layer[]>([]);
  public status$: Subject<SubjectStatus>;
  public propertyChange$: Subject<ObjectEvent>;
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

  get projection(): string {
    return this.viewController.getOlProjection().getCode();
  }

  constructor(
    options?: MapOptions,
    private storageService?: StorageService,
    private configService?: ConfigService) {
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
        const attributionOpt = (this.options.controls.attribution === true
          ? {}
          : this.options.controls.attribution) as MapAttributionOptions;
        controls.push(new olControlAttribution(attributionOpt));
      }
      if (this.options.controls.scaleLine) {
        const scaleLineOpt = (this.options.controls.scaleLine === true
          ? {}
          : this.options.controls.scaleLine) as MapScaleLineOptions;
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
        this.configService);
      this.geolocationController.setOlMap(this.ol);
      if (this.geolocationController) {
        this.geolocationController.updateGeolocationOptions(this.mapViewOptions);
      }
      setTimeout(() => {
        this.initLayerSyncFromRootParentLayers();
      }, 500);
      // A REVOIR 
      
  });
  this.propertyChange$.subscribe(p => this.handleLayerPropertyChange(p));
  }

  initLayerSyncFromRootParentLayers() {
    const rootLayersByProperty = {};
    const keys = Object.keys(LinkedProperties);
    keys.map(k => {
      rootLayersByProperty[LinkedProperties[k]] = [];
    })
    this.layers
      .filter(l => getLinkedLayersOptions(l))
      .map(l => {
        const currentId = l.id;
        keys.map(key => {
          const k = LinkedProperties[key];
          const plbp = getRootParentByProperty(this, l, k as LinkedProperties);
          const layers = rootLayersByProperty[k];
          const layersId = layers.map(l => l.id);
          if (!layersId.includes(currentId)) {
            rootLayersByProperty[k].push(plbp);
          }
        })
      })
    Object.keys(rootLayersByProperty).map(k => {
      const layers = rootLayersByProperty[k];
      layers.map((l: Layer) => l.ol.notify(k, undefined))
    })
  }

  private handleLayerPropertyChange(propertyChange: ObjectEvent) {
    if (!propertyChange) {
      return;
    }
    console.log('propertyChange',propertyChange);
    const key = propertyChange.key;
    const olLayer = propertyChange.target;
    const oldValue = propertyChange.oldValue;
    const newValue = olLayer.get(key);
    const initiatorIgoLayer = this.getLayerByOlLayer(olLayer);
    const initiatorLinkedLayersOptions = getLinkedLayersOptions(initiatorIgoLayer);
    if (initiatorLinkedLayersOptions) {
      const initiatorLinkId = initiatorLinkedLayersOptions.linkId;
     
      const rootParentByProperty = getRootParentByProperty(this,initiatorIgoLayer, key as LinkedProperties)
      console.log('Key', key);
      console.log('Initiator', initiatorIgoLayer.title);
      console.log('Parent___', rootParentByProperty.title);

      const clbp = [rootParentByProperty];
      getAllChildLayersByProperty(this, rootParentByProperty, clbp, key as LinkedProperties)

      clbp.map(l => {
        if (getUid(initiatorIgoLayer.ol) !== getUid(l.ol)) {
          console.log(l.title)
          l.ol.set(key, newValue, true);
          if (key === 'visible') {
            l.visible$.next(newValue);
          }
        }
      })






    }
  }

  setTarget(id: string) {
    this.ol.setTarget(id);
    if (id !== undefined) {
      this.layerWatcher.subscribe(() => { }, null);
    } else {
      this.layerWatcher.unsubscribe();
    }
  }

  updateView(options: MapViewOptions) {
    const currentView = this.ol.getView();
    const viewOptions = Object.assign(
      {
        zoom: currentView.getZoom()
      },
      currentView.getProperties()
    );

    this.setView(Object.assign(viewOptions, options));
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

    options = Object.assign({ constrainResolution: true }, options);
    const view = new olView(options);
    this.ol.setView(view);

    if (options) {
      if (options.maxLayerZoomExtent) {
        this.viewController.maxLayerZoomExtent = options.maxLayerZoomExtent;
      }

      if (options.center) {
        const projection = view.getProjection().getCode();
        const center = olproj.fromLonLat(options.center, projection);
        view.setCenter(center);
      }
    }
  }

  updateControls(value: MapControlsOptions) {
    if (value === undefined) {
      return;
    }

    const controls = [];
    if (value.attribution) {
      const attributionOpt = (value.attribution === true
        ? {}
        : value.attribution) as MapAttributionOptions;
      controls.push(new olControlAttribution(attributionOpt));
    }
    if (value.scaleLine) {
      const scaleLineOpt = (value.scaleLine === true
        ? {}
        : value.scaleLine) as MapScaleLineOptions;
      controls.push(new olControlScaleLine(scaleLineOpt));
    }

    const currentControls = Object.assign([], this.ol.getControls().getArray());
    currentControls.forEach(control => {
      this.ol.removeControl(control);
    });
    controls.forEach(control => {
      this.ol.addControl(control);
    });
  }

  /**
   * Deprecated
   * TODO: Move to ViewController and update every place it's used
   */
  getCenter(projection?: string | OlProjection): [number, number] {
    return this.viewController.getCenter(projection);
  }

  /**
   * Deprecated
   * TODO: Move to ViewController and update every place it's used
   */
  getExtent(projection?: string | OlProjection): MapExtent {
    return this.viewController.getExtent(projection);
  }

  // TODO: Move to ViewController and update every place it's used
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
        if (!layer) { return; }
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
      const index = newLayers.indexOf(layer);
      if (index >= 0) {
        layersToRemove.push(layer);
        newLayers.splice(index, 1);
        this.handleLinkedLayersDeletion(layer, layersToRemove);
        layersToRemove.map(linkedLayer => {
          layersToRemove.push(linkedLayer);
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
    const linkedLayers = srcLayer.options.linkedLayers;
    if (!linkedLayers) {
      return;
    }
    const currentLinkedId = linkedLayers.linkId;
    const currentLinks = linkedLayers.links;
    const isParentLayer = currentLinks ? true : false;
    if (isParentLayer) {
      // search for child layers
      currentLinks.map(link => {
        if (!link.syncedDelete) {
          return;
        }
        link.linkedIds.map(linkedId => {
          const layerToApply = this.layers.find(layer => layer.options.linkedLayers?.linkId === linkedId);
          if (layerToApply) {
            layersToRemove.push(layerToApply);
          }
        });
      });
    } else {
      // search for parent layer
      this.layers.map(layer => {
        if (layer.options.linkedLayers?.links) {
          layer.options.linkedLayers.links.map(l => {
            if (
              l.syncedDelete && l.bidirectionnal !== false &&
              l.linkedIds.indexOf(currentLinkedId) !== -1) {
              layersToRemove.push(layer);
              this.handleLinkedLayersDeletion(layer, layersToRemove);
            }
          });
        }
      });
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

  onOfflineToggle(offline: boolean) {
    this.offlineButtonToggle$.next(offline);
  }
}

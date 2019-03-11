import olMap from 'ol/Map';
import olView from 'ol/View';
import olFeature from 'ol/Feature';
import olGeolocation from 'ol/Geolocation';
import olControlAttribution from 'ol/control/Attribution';
import olControlScaleLine from 'ol/control/ScaleLine';
import * as olproj from 'ol/proj';
import * as olproj4 from 'ol/proj/proj4';
import OlProjection from 'ol/proj/Projection';
import * as olinteraction from 'ol/interaction';

import proj4 from 'proj4';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

import { SubjectStatus } from '@igo2/utils';

import { Layer } from '../../layer/shared/layers';
import { Overlay } from '../../overlay/shared/overlay';

import { LayerWatcher } from '../utils/layer-watcher';
import {
  MapViewOptions,
  MapOptions,
  MapAttributionOptions,
  MapScaleLineOptions,
  MapExtent
} from './map.interface';
import { MapViewController } from './controllers/view';

export class IgoMap {
  public ol: olMap;
  public layers$ = new BehaviorSubject<Layer[]>([]);
  public layers: Layer[] = [];
  public status$: Subject<SubjectStatus>;
  public geolocation$ = new BehaviorSubject<olGeolocation>(undefined);
  public geolocationFeature: olFeature;
  public overlay: Overlay;
  public viewController: MapViewController;

  private layerWatcher: LayerWatcher;
  private geolocation: olGeolocation;
  private geolocation$$: Subscription;

  private options: MapOptions;
  private defaultOptions: Partial<MapOptions> = {
    controls: { attribution: false }
  };

  get projection(): string {
    return this.viewController.getOlProjection().getCode();
  }

  constructor(options?: MapOptions) {
    this.options = Object.assign({}, this.defaultOptions, options);
    this.layerWatcher = new LayerWatcher();
    this.status$ = this.layerWatcher.status$;
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
    const viewOptions = Object.assign(
      {
        zoom: currentView.getZoom()
      },
      currentView.getProperties()
    );

    this.setView(Object.assign(viewOptions, options));
  }

  /**
   * Set the map view
   * @param options Map view options
   */
  setView(options: MapViewOptions) {
    const view = new olView(options);
    this.ol.setView(view);

    this.unsubscribeGeolocate();
    if (options) {
      if (options.center) {
        const projection = view.getProjection().getCode();
        const center = olproj.fromLonLat(options.center, projection);
        view.setCenter(center);
      }

      if (options.geolocate) {
        this.geolocate(true);
      }
    }
  }

  // TODO: Move to ViewController and update every place it's used
  getCenter(projection?: string | OlProjection): [number, number] {
    return this.viewController.getCenter();
  }

  // TODO: Move to ViewController and update every place it's used
  getExtent(projection?: string | OlProjection): MapExtent {
    return this.viewController.getExtent();
  }

  // TODO: Move to ViewController and update every place it's used
  getZoom(): number {
    return this.viewController.getZoom();
  }

  addLayer(layer: Layer, push = true) {
    if (layer.baseLayer && layer.visible) {
      this.changeBaseLayer(layer);
    }

    const existingLayer = this.getLayerById(layer.id);
    if (existingLayer !== undefined) {
      existingLayer.visible = true;
      return;
    }

    if (layer.zIndex === undefined || layer.zIndex === 0) {
      const offset = layer.baseLayer ? 1 : 10;
      layer.zIndex = this.layers.length + offset;
    }

    layer.add(this);

    this.layerWatcher.watchLayer(layer);

    if (push) {
      this.layers.splice(0, 0, layer);
      this.sortLayers();
      this.layers$.next(this.layers.slice(0));
    }
  }

  addLayers(layers: Layer[], push = true) {
    layers.forEach(layer => this.addLayer(layer, push));
  }

  changeBaseLayer(baseLayer: Layer) {
    if (!baseLayer) {
      return;
    }

    for (const bl of this.getBaseLayers()) {
      bl.visible = false;
    }

    baseLayer.visible = true;
  }

  getBaseLayers(): Layer[] {
    return this.layers.filter(layer => layer.baseLayer);
  }

  getLayerById(id: string): Layer {
    return this.layers.find(layer => layer.id && layer.id === id);
  }

  removeLayer(layer: Layer) {
    const index = this.getLayerIndex(layer);

    if (index >= 0) {
      this.layerWatcher.unwatchLayer(layer);
      layer.remove();
      this.layers.splice(index, 1);
      this.layers$.next(this.layers.slice(0));
    }
  }

  removeLayers() {
    this.layers.forEach(layer => {
      this.layerWatcher.unwatchLayer(layer);
      layer.remove();
    }, this);

    this.layers = [];
    this.layers$.next([]);
  }

  raiseLayer(layer: Layer) {
    const index = this.getLayerIndex(layer);
    if (index > 0) {
      this.moveLayer(layer, index, index - 1);
    }
  }

  lowerLayer(layer: Layer) {
    const index = this.getLayerIndex(layer);
    if (index < this.layers.length - 1) {
      this.moveLayer(layer, index, index + 1);
    }
  }

  moveLayer(layer: Layer, from: number, to: number) {
    const layerTo = this.layers[to];
    const zIndexTo = layerTo.zIndex;
    const zIndexFrom = layer.zIndex;

    layer.zIndex = zIndexTo;
    layerTo.zIndex = zIndexFrom;

    this.layers[to] = layer;
    this.layers[from] = layerTo;
    this.layers$.next(this.layers.slice(0));
  }

  /**
   * Get all layers activate in the map
   * @return Array of layers
   */
  getLayers() {
    return this.layers;
  }

  /**
   * Get all the layers legend
   * @return Array of legend
   */
  getLayersLegend() {
    // Get layers list
    const layers = this.getLayers();
    const listLegend = [];
    let title;
    let legendUrls;
    let legendImage;
    let heightPos = 0;
    const newCanvas = document.createElement('canvas');
    const newContext = newCanvas.getContext('2d');
    newContext.font = '20px Calibri';
    // For each layers in the map
    layers.forEach(layer => {
      // Add legend for only visible layer
      if (layer.visible === true) {
        // Get the list of legend
        legendUrls = layer.dataSource.getLegend();
        // If legend(s) are defined
        if (legendUrls.length > 0) {
          title = layer.title;
          // For each legend
          legendUrls.forEach(legendUrl => {
            // If the legend really exist
            if (legendUrl.url !== undefined) {
              // Create an image for the legend
              legendImage = new Image();
              legendImage.crossOrigin = 'Anonymous';
              legendImage.src = legendUrl.url;
              legendImage.onload = () => {
                newContext.fillText(title, 0, heightPos);
                newContext.drawImage(legendImage, 0, heightPos + 20);
                heightPos += legendImage.height + 5;
              };
              // Add legend info to the list
              listLegend.push({
                title,
                url: legendUrl.url,
                image: legendImage
              });
            }
          });
        }
      }
    });
    return listLegend;
  }

  // TODO: Create a GeolocationController
  geolocate(track = false) {
    let first = true;
    if (this.geolocation$$) {
      track = this.geolocation.getTracking();
      this.unsubscribeGeolocate();
    }
    this.startGeolocation();

    this.geolocation$$ = this.geolocation$.subscribe(geolocation => {
      if (!geolocation) {
        return;
      }
      const accuracy = geolocation.getAccuracy();
      if (accuracy < 10000) {
        const geometry = geolocation.getAccuracyGeometry();
        const extent = geometry.getExtent();
        if (
          this.geolocationFeature &&
          this.overlay.dataSource.ol.getFeatureById(
            this.geolocationFeature.getId()
          )
        ) {
          this.overlay.dataSource.ol.removeFeature(this.geolocationFeature);
        }
        this.geolocationFeature = new olFeature({ geometry });
        this.geolocationFeature.setId('geolocationFeature');
        this.overlay.addFeature(this.geolocationFeature);
        if (first) {
          this.viewController.zoomToExtent(extent);
        }
      } else if (first) {
        const view = this.ol.getView();
        const coordinates = geolocation.getPosition();
        view.setCenter(coordinates);
        view.setZoom(14);
      }
      if (track) {
        this.unsubscribeGeolocate();
      }
      first = false;
    });
  }

  unsubscribeGeolocate() {
    this.stopGeolocation();
    if (this.geolocation$$) {
      this.geolocation$$.unsubscribe();
      this.geolocation$$ = undefined;
    }
  }

  private startGeolocation() {
    if (!this.geolocation) {
      this.geolocation = new olGeolocation({
        projection: this.projection,
        tracking: true
      });

      this.geolocation.on('change', evt => {
        this.geolocation$.next(this.geolocation);
      });
    } else {
      this.geolocation.setTracking(true);
    }
  }

  private stopGeolocation() {
    if (this.geolocation) {
      this.geolocation.setTracking(false);
    }
  }

  private sortLayers() {
    // Sort by descending zIndex
    this.layers.sort((layer1, layer2) => layer2.zIndex - layer1.zIndex);
  }

  private getLayerIndex(layer: Layer) {
    return this.layers.findIndex(layer2 => layer2 === layer);
  }

}

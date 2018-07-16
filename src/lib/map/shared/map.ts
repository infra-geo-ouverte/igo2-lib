import Map from 'ol/map';
import View from 'ol/view';
import proj from 'ol/proj';
import easing from 'ol/easing';
import Stroke from 'ol/style/stroke';
import Fill from 'ol/style/fill';
import Style from 'ol/style/style';
import Circle from 'ol/style/circle';
import Icon from 'ol/style/icon';
import Attribution from 'ol/control/attribution';
import ScaleLine from 'ol/control/scaleline';
import Interaction from 'ol/interaction';
import Feature from 'ol/feature';
import Geolocation from 'ol/geolocation';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { LayerWatcher } from '../utils';
import { SubjectStatus } from '../../utils';
import { Layer, VectorLayer } from '../../layer/shared/layers';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';

import { MapViewOptions, MapOptions } from './map.interface';


export class IgoMap {

  public ol: Map;
  public layers$ = new BehaviorSubject<Layer[]>([]);
  public layers: Layer[] = [];
  public status$: Subject<SubjectStatus>;
  public resolution$ = new BehaviorSubject<Number>(undefined);
  public geolocation$ = new BehaviorSubject<ol.Geolocation>(undefined);

  public overlayMarkerStyle: Style;
  public overlayStyle: Style;
  private overlayDataSource: FeatureDataSource;

  private layerWatcher: LayerWatcher;
  private geolocation: ol.Geolocation;
  private geolocation$$: Subscription;
  private geolocationFeature: ol.Feature;

  private options: MapOptions = {
    controls: {attribution: true},
    overlay: true
  };

  get projection(): string {
    return this.ol.getView().getProjection().getCode();
  }

  get resolution(): number {
    return this.ol.getView().getResolution();
  }

  constructor(options?: MapOptions) {
    Object.assign(this.options, options);
    this.layerWatcher = new LayerWatcher();
    this.status$ = this.layerWatcher.status$;

    this.init();
  }

  init() {
    const controls = [];
    if (this.options.controls) {
      if (this.options.controls.attribution) {
        const attributionOpt = (this.options.controls.attribution === true ?
          {} : this.options.controls.attribution) as ol.olx.control.AttributionOptions;
        controls.push(new Attribution(attributionOpt));
      }
      if (this.options.controls.scaleLine) {
        const scaleLineOpt = (this.options.controls.scaleLine === true ?
          {} : this.options.controls.scaleLine) as ol.olx.control.ScaleLineOptions;
        controls.push(new ScaleLine(scaleLineOpt));
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

    this.ol = new Map({
      interactions: Interaction.defaults(interactions),
      controls: controls
    });

    this.ol.on('moveend', (e) => {
      if (this.resolution$.value !== this.resolution) {
        this.resolution$.next(this.resolution);
      }
    });

    if (this.options.overlay) {
      this.overlayMarkerStyle = new Style({
        image: new Icon({
          src: './assets/igo2/icons/place_blue_36px.svg',
          imgSize: [36, 36], // for ie
          anchor: [0.5, 1]
        })
      });

      this.overlayDataSource = new FeatureDataSource({
        title: 'Overlay'
      });

      const stroke = new Stroke({
        color: [0, 161, 222, 1],
        width: 2
      });

      const fill = new Fill({
        color: [0, 161, 222, 0.15]
      });

      this.overlayStyle = new Style({
        stroke: stroke,
        fill: fill,
        image: new Circle({
          radius: 5,
          stroke: stroke,
          fill: fill
        })
      });

      const layer = new VectorLayer(this.overlayDataSource, {
        zIndex: 999,
        style: this.overlayStyle
      });
      this.addLayer(layer, false);
    }
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
    const viewOptions = Object.assign({
      zoom: currentView.getZoom()
    }, currentView.getProperties());

    this.setView(Object.assign(viewOptions, options));
  }

  setView(options: MapViewOptions) {
    const view = new View(options);
    this.ol.setView(view);

    this.unsubscribeGeolocate();
    if (options) {
      if (options.center) {
        const center = proj.fromLonLat(options.center, this.projection);
        view.setCenter(center);
      }

      if (options.geolocate) {
        this.geolocate(true);
      }
    }
  }

  getCenter(projection?): [number, number] {
    let center = this.ol.getView().getCenter();
    if (projection && center) {
      center = proj.transform(center, this.projection, projection);
    }
    return center;
  }

  getExtent(projection?): [number, number, number, number] {
    let ext = this.ol.getView().calculateExtent(this.ol.getSize());
    if (projection && ext) {
      ext = proj.transformExtent(ext, this.projection, projection);
    }
    return ext;
  }

  getZoom(): number {
    return Math.round(this.ol.getView().getZoom());
  }

  zoomIn() {
    this.zoomTo(this.ol.getView().getZoom() + 1);
  }

  zoomOut() {
    this.zoomTo(this.ol.getView().getZoom() - 1);
  }

  zoomTo(zoom: number) {
    this.ol.getView().animate({
      zoom: zoom,
      duration: 250,
      easing: easing.easeOut
    });
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
    if (!baseLayer) { return; }

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

  moveToExtent(extent: ol.Extent) {
    const view = this.ol.getView();
    view.fit(extent, {
      maxZoom: view.getZoom()
    });
  }

  moveToFeature(feature: ol.Feature) {
    this.moveToExtent(feature.getGeometry().getExtent());
  }

  zoomToExtent(extent: ol.Extent) {
    const view = this.ol.getView();
    view.fit(extent, {
      maxZoom: 17
    });
  }

  zoomToFeature(feature: ol.Feature) {
    this.zoomToExtent(feature.getGeometry().getExtent());
  }

  addOverlay(feature: ol.Feature) {
    const geometry = feature.getGeometry();
    if (geometry === null) { return; }

    if (geometry.getType() === 'Point') {
      feature.setStyle([this.overlayMarkerStyle]);
    }

    this.overlayDataSource.ol.addFeature(feature);
  }

  clearOverlay() {
    if (this.overlayDataSource && this.overlayDataSource.ol) {
      this.overlayDataSource.ol.clear();
    }
  }

  geolocate(track = false) {
    let first = true;
    if (this.geolocation$$) {
      track = this.geolocation.getTracking();
      this.unsubscribeGeolocate();
    }
    this.startGeolocation();

    this.geolocation$$ = this.geolocation$.subscribe((geolocation) => {
      if (!geolocation) { return; }
      const accuracy = geolocation.getAccuracy();
      if (accuracy < 10000) {
        const geometry = geolocation.getAccuracyGeometry();
        const extent = geometry.getExtent();
        if (this.geolocationFeature &&
            this.overlayDataSource.ol.getFeatureById(this.geolocationFeature.getId())) {

          this.overlayDataSource.ol.removeFeature(this.geolocationFeature);
        }
        this.geolocationFeature = new Feature({geometry: geometry});
        this.geolocationFeature.setId('geolocationFeature');
        this.addOverlay(this.geolocationFeature);
        if (first) {
          this.zoomToExtent(extent);
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
      this.geolocation = new Geolocation({
        projection: this.projection,
        tracking: true
      });

      this.geolocation.on('change', (evt) => {
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
    return this.layers.findIndex(layer_ => layer_ === layer);
  }
}

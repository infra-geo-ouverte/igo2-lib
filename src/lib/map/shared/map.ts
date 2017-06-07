import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';

import { LayerWatcher } from '../utils';
import { SubjectStatus } from '../../utils';
import { Layer, VectorLayer } from '../../layer/shared/layers';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';

import { MapViewOptions } from './map.interface';


export class IgoMap {

  public ol: ol.Map;
  public layers$ = new BehaviorSubject<Layer[]>([]);
  public layers: Layer[] = [];
  public status$: Subject<SubjectStatus>;
  public resolution$ = new BehaviorSubject<Number>(undefined);

  private overlayDataSource: FeatureDataSource;
  private overlayMarkerStyle: ol.style.Style;
  private layerWatcher: LayerWatcher;

  get projection(): string {
    return this.ol.getView().getProjection().getCode();
  }

  get resolution(): number {
    return this.ol.getView().getResolution();
  }

  constructor() {
    this.layerWatcher = new LayerWatcher();
    this.status$ = this.layerWatcher.status$;

    this.init();
  }

  init() {
    this.ol = new ol.Map({
      controls: [
        new ol.control.Attribution()
      ]
    });

    this.ol.on('moveend', (e) => {
      if (this.resolution$.value !== this.resolution) {
        this.resolution$.next(this.resolution);
      }
    });

    this.overlayMarkerStyle = new ol.style.Style({
      image: new ol.style.Icon({
        src: './assets/igo2/icons/place_blue_36px.svg',
        imgSize: [36, 36], // for ie
        anchor: [0.5, 1]
      })
    });

    this.overlayDataSource = new FeatureDataSource({
      title: 'Overlay'
    });

    const stroke = new ol.style.Stroke({
      color: [0, 161, 222, 1],
      width: 2
    });

    const fill = new ol.style.Fill({
      color: [0, 161, 222, 0.15]
    });

    const layer = new VectorLayer(this.overlayDataSource, {
      zIndex: 999,
      style: new ol.style.Style({
        stroke: stroke,
        fill: fill,
        image: new ol.style.Circle({
          radius: 5,
          stroke: stroke,
          fill: fill
        })
      })
    });
    this.addLayer(layer, false);
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
    const view = new ol.View(options);
    this.ol.setView(view);

    if (options && options.center) {
      const center = ol.proj.fromLonLat(options.center, this.projection);
      view.setCenter(center);
    }
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
      easing: ol.easing.easeOut
    });
  }

  addLayer(layer: Layer, push = true) {
    const existingLayer = this.getLayerById(layer.id);
    if (existingLayer !== undefined) {
      existingLayer.visible = true;
      return;
    }

    if (layer.zIndex === undefined || layer.zIndex === 0) {
      layer.zIndex = this.layers.length + 1;
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
    this.layers$.next(this.layers.slice(0));
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

    let marker;
    if (geometry.getType() === 'Point') {
      marker = feature;
    } else {
      const centroid = ol.extent.getCenter(geometry.getExtent());
      marker = new ol.Feature(new ol.geom.Point(centroid));

      this.overlayDataSource.ol.addFeature(feature);
    }

    marker.setStyle(this.overlayMarkerStyle);
    this.overlayDataSource.ol.addFeature(marker);
  }

  clearOverlay() {
    this.overlayDataSource.ol.clear();
  }

  private sortLayers() {
    // Sort by descending zIndex
    this.layers.sort((layer1, layer2) => layer2.zIndex - layer1.zIndex);
  }

  private getLayerIndex(layer: Layer) {
    return this.layers.findIndex(layer_ => layer_ === layer);
  }
}

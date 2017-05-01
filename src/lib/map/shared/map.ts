import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Layer } from '../../layer';

import { MapViewOptions } from './map.interface';


export class IgoMap {

  public olMap: ol.Map;
  public layers$ = new BehaviorSubject<Layer[]>([]);
  public layers: Layer[] = [];

  get projection(): string {
    return this.olMap.getView().getProjection().getCode();
  }

  constructor() {
    this.olMap = new ol.Map({
      controls: [
        new ol.control.Attribution()
      ]
    });
  }

  updateView(options: MapViewOptions) {
    const currentView = this.olMap.getView();
    const viewOptions = Object.assign({
      zoom: currentView.getZoom()
    }, currentView.getProperties());

    this.setView(Object.assign(viewOptions, options));
  }

  setView(options: MapViewOptions) {
    const view = new ol.View(options);
    this.olMap.setView(view);

    if (options && options.center) {
      const center = ol.proj.fromLonLat(options.center, this.projection);
      view.setCenter(center);
    }
  }

  zoomIn() {
    this.zoomTo(this.olMap.getView().getZoom() + 1);
  }

  zoomOut() {
    this.zoomTo(this.olMap.getView().getZoom() - 1);
  }

  zoomTo(zoom: number) {
    this.olMap.getView().animate({
      zoom: zoom,
      duration: 250,
      easing: ol.easing.easeOut
    });
  }

  addLayer(layer: Layer, push = true) {
    if (layer.zIndex === undefined || layer.zIndex === 0) {
      layer.zIndex = this.layers.length + 1;
    }

    const existingLayer = this.getLayerById(layer.id);
    if (existingLayer !== undefined) {
      existingLayer.visible = true;
      return;
    }

    layer.addToMap(this);

    if (push) {
      this.layers.splice(0, 0, layer);
      this.sortLayers();
      this.layers$.next(this.layers.slice(0));
    }
  }

  getLayerById(id: string): Layer {
    return this.layers.find(layer => {
      return layer.id && layer.id === id;
    });
  }

  removeLayer(layer: Layer) {
    const index = this.getLayerIndex(layer);
    if (index >= 0) {
      this.olMap.removeLayer(layer.olLayer);
      this.layers.splice(index, 1);
      this.layers$.next(this.layers.slice(0));
    }
  }

  removeLayers() {
    this.layers.forEach(layer =>
      this.olMap.removeLayer(layer.olLayer), this);
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
    const view = this.olMap.getView();
    view.fit(extent, {
      maxZoom: view.getZoom()
    });
  }

  moveToFeature(feature: ol.Feature) {
    this.moveToExtent(feature.getGeometry().getExtent());
  }

  zoomToExtent(extent: ol.Extent) {
    const view = this.olMap.getView();
    view.fit(extent, {
      maxZoom: 17
    });
  }

  zoomToFeature(feature: ol.Feature) {
    this.zoomToExtent(feature.getGeometry().getExtent());
  }

  private sortLayers() {
    // Sort by descending zIndex
    this.layers.sort((layer1, layer2) => layer2.zIndex - layer1.zIndex);
  }

  private getLayerIndex(layer: Layer) {
    return this.layers.findIndex(layer_ => layer_ === layer);
  }
}

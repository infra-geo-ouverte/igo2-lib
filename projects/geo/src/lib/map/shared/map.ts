import olMap from 'ol/Map';
import olView from 'ol/View';
import olFeature from 'ol/Feature';
import olGeolocation from 'ol/Geolocation';
import olControlAttribution from 'ol/control/Attribution';
import olControlScaleLine from 'ol/control/ScaleLine';
import * as olproj from 'ol/proj';
import * as olproj4 from 'ol/proj/proj4';
import * as oleasing from 'ol/easing';
import * as olinteraction from 'ol/interaction';
import * as olstyle from 'ol/style';

import proj4 from 'proj4';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

import { SubjectStatus } from '@igo2/utils';

import { Layer, VectorLayer } from '../../layer/shared/layers';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';

import { LayerWatcher } from '../utils';
import {
  MapViewOptions,
  MapOptions,
  AttributionOptions,
  ScaleLineOptions
} from './map.interface';

export class IgoMap {
  public ol: olMap;
  public layers$ = new BehaviorSubject<Layer[]>([]);
  public layers: Layer[] = [];
  public status$: Subject<SubjectStatus>;
  public resolution$ = new BehaviorSubject<Number>(undefined);
  public geolocation$ = new BehaviorSubject<olGeolocation>(undefined);
  public geolocationFeature: olFeature;

  public overlayMarkerStyle: olstyle.Style;
  public overlayStyle: olstyle.Style;
  private overlayDataSource: FeatureDataSource;

  private layerWatcher: LayerWatcher;
  private geolocation: olGeolocation;
  private geolocation$$: Subscription;

  private options: MapOptions = {
    controls: { attribution: true },
    overlay: true
  };

  get projection(): string {
    const p = this.ol
      .getView()
      .getProjection()
      .getCode();

    return p;
  }

  get resolution(): number {
    return this.ol.getView().getResolution();
  }

  constructor(options?: MapOptions) {
    Object.assign(this.options, options);
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
          : this.options.controls.attribution) as AttributionOptions;
        controls.push(new olControlAttribution(attributionOpt));
      }
      if (this.options.controls.scaleLine) {
        const scaleLineOpt = (this.options.controls.scaleLine === true
          ? {}
          : this.options.controls.scaleLine) as ScaleLineOptions;
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
      controls: controls
    });

    this.ol.on('moveend', e => {
      if (this.resolution$.value !== this.resolution) {
        this.resolution$.next(this.resolution);
      }
    });

    if (this.options.overlay) {
      this.overlayMarkerStyle = this.setOverlayMarkerStyle();

      this.overlayDataSource = new FeatureDataSource();

      const stroke = new olstyle.Stroke({
        color: [0, 161, 222, 1],
        width: 2
      });

      const fill = new olstyle.Fill({
        color: [0, 161, 222, 0.15]
      });

      this.overlayStyle = new olstyle.Style({
        stroke: stroke,
        fill: fill,
        image: new olstyle.Circle({
          radius: 5,
          stroke: stroke,
          fill: fill
        })
      });

      const layer = new VectorLayer({
        title: 'Overlay',
        zIndex: 999,
        style: this.overlayStyle,
        source: this.overlayDataSource
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
    const viewOptions = Object.assign(
      {
        zoom: currentView.getZoom()
      },
      currentView.getProperties()
    );

    this.setView(Object.assign(viewOptions, options));
  }

  setView(options: MapViewOptions) {
    const view = new olView(options);
    this.ol.setView(view);

    this.unsubscribeGeolocate();
    if (options) {
      if (options.center) {
        const center = olproj.fromLonLat(options.center, this.projection);
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
      center = olproj.transform(center, this.projection, projection);
    }
    return center;
  }

  getExtent(projection?): [number, number, number, number] {
    let ext = this.ol.getView().calculateExtent(this.ol.getSize());
    if (projection && ext) {
      ext = olproj.transformExtent(ext, this.projection, projection);
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
      easing: oleasing.easeOut
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

  moveToExtent(extent: [number, number, number, number]) {
    const view = this.ol.getView();
    view.fit(extent, {
      maxZoom: view.getZoom()
    });
  }

  moveToFeature(feature: olFeature) {
    this.moveToExtent(feature.getGeometry().getExtent());
  }

  zoomToExtent(extent: [number, number, number, number]) {
    const view = this.ol.getView();
    view.fit(extent, {
      maxZoom: 17
    });
  }

  zoomToFeature(feature: olFeature) {
    this.zoomToExtent(feature.getGeometry().getExtent());
  }

  addOverlay(feature: olFeature) {
    const geometry = feature.getGeometry();
    if (geometry === null) {
      return;
    }

    if (geometry.getType() === 'Point') {
      feature.setStyle([this.overlayMarkerStyle]);
    }

    this.overlayDataSource.ol.addFeature(feature);
  }

  removeOverlayByID(id) {
    if (this.overlayDataSource.ol.getFeatureById(id)) {
      this.overlayDataSource.ol.removeFeature(
        this.overlayDataSource.ol.getFeatureById(id)
      );
    }
  }

  clearOverlay() {
    if (this.overlayDataSource && this.overlayDataSource.ol) {
      this.overlayDataSource.ol.clear();
    }
  }

  /**
  Get Scale of the map
  @return Scale of the map
  */
  getMapScale(approximative, resolution) {
    if (approximative) {
      let scale = this.getScale(resolution);
      scale = Math.round(scale);
      if (scale < 10000) {
        return scale;
      }
      scale = Math.round(scale / 1000);
      if (scale < 1000) {
        return scale + 'K';
      }
      scale = Math.round(scale / 1000);
      return scale + 'M';
    }
    return this.getScale(resolution);
  }

  getScale(dpi = 96) {
    const unit = this.ol
      .getView()
      .getProjection()
      .getUnits();
    const resolution = this.ol.getView().getResolution();
    const inchesPerMetre = 39.37;
    return resolution * olproj.METERS_PER_UNIT[unit] * inchesPerMetre * dpi;
  }

  /**
  Get all layers activate in the map
  @return Array of layers
  */
  getLayers() {
    return this.layers;
  }

  /**
  Get all the layers legend
  @return Array of legend
  */
  getLayersLegend() {
    // Get layers list
    const layers = this.getLayers();
    const listLegend = [];
    let title, legendUrls, legendImage;
    let heightPos = 0;
    const newCanvas = document.createElement('canvas');
    const newContext = newCanvas.getContext('2d');
    newContext.font = '20px Calibri';
    // For each layers in the map
    layers.forEach(function(layer) {
      // Add legend for only visible layer
      if (layer.visible === true) {
        // Get the list of legend
        legendUrls = layer.dataSource.getLegend();
        // If legend(s) are defined
        if (legendUrls.length > 0) {
          title = layer.title;
          // For each legend
          legendUrls.forEach(function(legendUrl) {
            // If the legend really exist
            if (legendUrl.url !== undefined) {
              // Create an image for the legend
              legendImage = new Image();
              legendImage.crossOrigin = 'Anonymous';
              legendImage.src = legendUrl.url;
              legendImage.onload = function() {
                newContext.fillText(title, 0, heightPos);
                newContext.drawImage(legendImage, 0, heightPos + 20);
                heightPos += legendImage.height + 5;
              };
              // Add legend info to the list
              listLegend.push({
                title: title,
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

  setOverlayMarkerStyle(color = 'blue', text = undefined): olstyle.Style {
    let iconColor;
    switch (color) {
      case 'blue':
        iconColor = 'blue';
        break;
      case 'red':
        iconColor = 'red';
        break;
      case 'yellow':
        iconColor = 'yellow';
        break;
      case 'green':
        iconColor = 'green';
        break;
      default:
        iconColor = 'blue';
        break;
    }
    return new olstyle.Style({
      image: new olstyle.Icon({
        src: './assets/igo2/geo/icons/place_' + iconColor + '_36px.svg',
        imgSize: [36, 36], // for ie
        anchor: [0.5, 1]
      }),
      text: new olstyle.Text({
        font: '12px Calibri,sans-serif',
        text: text,
        fill: new olstyle.Fill({ color: '#000' }),
        stroke: new olstyle.Stroke({ color: '#fff', width: 3 })
      })
    });
  }

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
          this.overlayDataSource.ol.getFeatureById(
            this.geolocationFeature.getId()
          )
        ) {
          this.overlayDataSource.ol.removeFeature(this.geolocationFeature);
        }
        this.geolocationFeature = new olFeature({ geometry: geometry });
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
    return this.layers.findIndex(layer_ => layer_ === layer);
  }
}

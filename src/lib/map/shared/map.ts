import * as ol from 'openlayers';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { LayerWatcher } from '../utils';
import { SubjectStatus } from '../../utils';
import { Layer, VectorLayer } from '../../layer/shared/layers';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';

import { MapViewOptions, MapOptions } from './map.interface';

import { saveAs } from 'file-saver';

import * as html2canvas from "html2canvas";

export class IgoMap {

  public ol: ol.Map;
  public layers$ = new BehaviorSubject<Layer[]>([]);
  public layers: Layer[] = [];
  public status$: Subject<SubjectStatus>;
  public resolution$ = new BehaviorSubject<Number>(undefined);
  public geolocation$ = new BehaviorSubject<ol.Geolocation>(undefined);

  public overlayMarkerStyle: ol.style.Style;
  public overlayStyle: ol.style.Style;
  private overlayDataSource: FeatureDataSource;

  private layerWatcher: LayerWatcher;
  private geolocation: ol.Geolocation;
  private geolocation$$: Subscription;
  private geolocationFeature: ol.Feature;

  private options: MapOptions = {
    controls: { attribution: true },
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
        controls.push(new ol.control.Attribution(attributionOpt));
      }
      if (this.options.controls.scaleLine) {
        const scaleLineOpt = (this.options.controls.scaleLine === true ?
          {} : this.options.controls.scaleLine) as ol.olx.control.ScaleLineOptions;
        controls.push(new ol.control.ScaleLine(scaleLineOpt));
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

    this.ol = new ol.Map({
      interactions: ol.interaction.defaults(interactions),
      controls: controls
    });

    this.ol.on('moveend', (e) => {
      if (this.resolution$.value !== this.resolution) {
        this.resolution$.next(this.resolution);
      }
    });

    if (this.options.overlay) {
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

      this.overlayStyle = new ol.style.Style({
        stroke: stroke,
        fill: fill,
        image: new ol.style.Circle({
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
      this.layerWatcher.subscribe(() => { }, null);
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

    this.unsubscribeGeolocate();
    if (options) {
      if (options.center) {
        const center = ol.proj.fromLonLat(options.center, this.projection);
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
      center = ol.proj.transform(center, this.projection, projection);
    }
    return center;
  }

  getExtent(projection?): [number, number, number, number] {
    let ext = this.ol.getView().calculateExtent(this.ol.getSize());
    if (projection && ext) {
      ext = ol.proj.transformExtent(ext, this.projection, projection);
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
      easing: ol.easing.easeOut
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
        this.geolocationFeature = new ol.Feature({ geometry: geometry });
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

  /**
  Get Projection of the map
  */
  getProjection() {
    return this.projection;
  }

  /**
  Get Scale of the map
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
    let unit = this.ol.getView().getProjection().getUnits();
    let resolution = this.ol.getView().getResolution();
    let inchesPerMetre = 39.37;

    return resolution * ol.proj.METERS_PER_UNIT[unit] * inchesPerMetre * dpi;
  }

  /**
  Get all layers activate in the map
  @return {Array} Arrat of layers
  */
  getLayers()
  {
    return this.layers;
  }

  /**
  Get all the layers legend
  @return {Array} Array of legend
  */
  getAllLayersLegend() {
    //Get layers list
    let layers = this.getLayers();
    let listLegend = [];
    let title, legendUrls, legendImage;
    let heightPos = 0;
    let newCanvas = document.createElement('canvas');
    let newContext = newCanvas.getContext('2d');
    newContext.font = "20px Calibri";

    //For each layers in the map
    layers.forEach(function(layer) {

      //Add legend for only visible layer
      if(layer.visible === true) {
        //Get the list of legend
        legendUrls = layer.dataSource.getLegend();
        //If legend(s) are defined
        if(legendUrls.length > 0) {
          title = layer.title;
          //For each legend
          legendUrls.forEach(function(legendUrl) {

            //If the legend really exist
            if(legendUrl.url !== undefined) {
              //Create an image for the legend
              legendImage = new Image;
              legendImage.crossOrigin = 'Anonymous';
              legendImage.src = legendUrl.url;
              legendImage.onload = function(){
                newContext.fillText(title, 0, heightPos);
                newContext.drawImage(legendImage,0, heightPos+20);
                heightPos+=legendImage.height+5;
              };
              //Add legend info to the list
              listLegend.push({title: title, url: legendUrl.url, image: legendImage});
            }
          });
        }
      }
    });
    return listLegend;
  }

  /**
  Get all individual legend images
  @return {file(s)} All images of the legend by name
  */
  getAllLayersIndividualLegendImages() {

    let listLegend = this.getAllLayersLegend();
    let newCanvas = document.createElement('canvas');
    let newContext = newCanvas.getContext('2d');
    let format = "png";
    let blobFormat = "image/" + format;
    listLegend.forEach(function(legend) {
      legend.image.onload = function(){

        newContext.drawImage(legend.image, 0, 0);

        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(newCanvas.msToBlob(), 'map.' + format);
        } else {
          newCanvas.toBlob(function(blob) {
            saveAs(blob, legend.title+"." + format);
          }, blobFormat);
        }
      }
    });
  }

  /**
  Get html code for all layers legend
  @param {string} width - The width that the legend need to be
  @return {string} Html code for the legend
  */
  getAllLayersLegendHtml(width) {
    //Get html code for the legend
    let listLegend = this.getAllLayersLegend();
    let html = "";
    if(listLegend.length > 0) {
      //Define important style to be sure that all container is convert to image not just visible part
      html += '<style media="screen" type="text/css">';
      html += '.html2canvas-container { width: 3000px !important; height: 3000px !important; }';
      html += '</style>';
      html += '<font size="2" face="Courier New" >';
      html += "<div style='display:inline-block;width:" + width + "mm;max-width:" + width + "mm'>";

      //For each legend, define an html table cell
      listLegend.forEach(function(legend) {
        html += "<table border=1 style='display:inline-block;vertical-align: top'><tr><th width='170px'>" + legend.title + "</th>";
        html += "<td><img class='printImageLegend' src='" + legend.url + "'></td></tr></table>";
      });

      html += "</div>";
    }

    return html;
  }

  /**
  Get all the legend in a single image
    @param {string} format - Image format. default value to "png"
    @return {file} The image of the legend
  */
  getAllLayersLegendImage(format="png") {
    //Get html code for the legend
    let width = 200; //milimeters unit, originally define for document pdf
    let html = this.getAllLayersLegendHtml(width);
    format = format.toLowerCase();
    let blobFormat = "image/" + format;

    //If no legend show No LEGEND in an image
    if (html.length == 0) {
      html = '<font size="12" face="Courier New" >';
      html += "<div align='center'><b>NO LEGEND</b></div>";
    }

    //Create new temporary window to define html code to generate canvas image
    let winTempCanva = window.open("", "legend", "width=10, height=10");

    //Create div to contain html code for legend
    let div = winTempCanva.document.createElement('div');

    //Define event to execute after all images are loaded to create the canvas
    winTempCanva.addEventListener('load',function() {
      html2canvas(div, {useCORS : true}).then(canvas => {
        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(canvas.msToBlob(), 'legendImage.' + format);
        } else {
          canvas.toBlob(function(blob) {
            //download image
            saveAs(blob, "legendImage." + format);
          }, blobFormat);
        }
        winTempCanva.close(); //close temp window
      });
    }, false);

    //Add html code to convert in the new window
    winTempCanva.document.body.appendChild(div);
    div.innerHTML = html;
  }

  private startGeolocation() {
    if (!this.geolocation) {
      this.geolocation = new ol.Geolocation({
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

  addLegend(doc) {
  //map.addToDocAllLayersLegendImage(doc);
  //Get html code for the legend
  let width = doc.internal.pageSize.width-10; //let a 10mm for extra
  let html = this.getAllLayersLegendHtml(width);

  //If no legend, save the map directly
  if(html=="") {
    doc.save('map.pdf')
    return true;
  }

  //Create new temporary window to define html code to generate canvas image
  let winTempCanva = window.open("", "legend", "width=10, height=10");

  //Create div to contain html code for legend
  let div = winTempCanva.document.createElement('div');
//  let that = this;
  //Define event to execute after all images are loaded to create the canvas (it's why we use window.open)
  winTempCanva.addEventListener('load',function() {
    html2canvas(div, {useCORS : true}).then(canvas => {
      var imgData;
      var position = 10;
      var pageHeight = doc.internal.pageSize.height;
      var pageWidth = doc.internal.pageSize.width;
      try {
        imgData = canvas.toDataURL('image/png');

        //doc.addPage();
        //doc.addImage(imgData, 'PNG', 10, 10);
        doc.addPage();
        doc.addImage(imgData, 'PNG', 10, position, pageWidth, pageHeight-20);

        winTempCanva.onunload = function(){doc.save('map.pdf')};
        winTempCanva.close(); //close temp window

      } catch (err) {
        winTempCanva.close(); //close temp window
    /*    that.messageService.error(
          'Security error: The legend cannot be printed.',
          'Print', 'print');
*/
        throw new Error(err);
      }
    });
  }, false);

  //Add html code to convert in the new window
  winTempCanva.document.body.appendChild(div);
  div.innerHTML = html;
}

}

import {
  Directive,
  Input,
  OnDestroy,
  Self,
  OnInit,
  HostListener
} from '@angular/core'
  ;
import olLayerVectorTile from 'ol/layer/VectorTile';
import olLayerVector from 'ol/layer/Vector';

import { Subscription } from 'rxjs';
import olVectorTileSource from 'ol/source/VectorTile';

import type { default as OlMapBrowserEvent } from 'ol/MapBrowserEvent';

import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { Feature } from '../../feature/shared/feature.interfaces';

import type { default as OlGeometry } from 'ol/geom/Geometry';
import OlFeature from 'ol/Feature';
import * as OlGeom from 'ol/geom';

import { EntityStore } from '@igo2/common';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { VectorLayer, Layer, VectorTileLayer } from '../../layer/shared/layers';
import { take } from 'rxjs/operators';
import { tryBindStoreLayer } from '../../feature/shared/feature.utils';
import { FeatureStore } from '../../feature/shared/store';
import { FeatureMotion } from '../../feature/shared/feature.enums';
import { MediaService } from '@igo2/core';
import { StyleService } from '../../style/style-service/style.service';
import { unByKey } from 'ol/Observable';
import RenderFeature from 'ol/render/Feature';
import { StyleByAttribute } from '../../style/shared/vector/vector-style.interface';
import { hoverFeatureMarkerStyle } from '../../style/shared/feature/feature-style';

/**
 * This directive makes the mouse coordinate trigger a reverse search on available search sources.
 * The search results are placed into a label, on a cross icon, representing the mouse coordinate.
 * By default, no search sources. Config in config file must be defined.
 * the layer level.
 */
@Directive({
  selector: '[igoHoverFeature]'
})
export class HoverFeatureDirective implements OnInit, OnDestroy {

  public store: FeatureStore<Feature>;
  private pointerHoverFeatureStore: EntityStore<OlFeature<OlGeometry>> = new EntityStore<OlFeature<OlGeometry>>([]);
  private lastTimeoutRequest;
  private store$$: Subscription;
  private layers$$: Subscription;

  private selectionLayer: olLayerVectorTile;
  private selectionMVT = {};
  private mvtStyleOptions: StyleByAttribute;

  /**
   * Listener to the pointer move event
   */
  private pointerMoveListener;

  private singleClickMapListener;

  private hoverFeatureId: string = 'hoverFeatureId';
  /**
   * The delay where the mouse must be motionless before trigger the reverse search
   */
  @Input() igoHoverFeatureDelay: number = 1000;

  /**
   * If the user has enabled or not the directive
   */
  @Input() igoHoverFeatureEnabled: boolean = false;

  @HostListener('mouseout')
  mouseout() {
    clearTimeout(this.lastTimeoutRequest);
    this.clearLayer();
  }

  /**
   * IGO map
   * @internal
   */
  get map(): IgoMap {
    return this.component.map;
  }

  get mapProjection(): string {
    return (this.component.map as IgoMap).projection;
  }

  constructor(
    @Self() private component: MapBrowserComponent,
    private mediaService: MediaService,
    private styleService: StyleService,
  ) { }

  /**
   * Start listening to pointermove and reverse search results.
   * @internal
   */
  ngOnInit() {
    this.listenToMapPointerMove();
    this.subscribeToPointerStore();
    this.listenToMapClick();

    this.map.status$.pipe(take(1)).subscribe(() => {
      this.store = new FeatureStore<Feature>([], { map: this.map });
      this.initStore();
    });

    // To handle context change without using the contextService.
    this.layers$$ = this.map.layers$.subscribe((layers: Layer[]) => {
      if (this.store && !layers.find(l => l.id === 'hoverFeatureId')) {
        this.initStore();
      }
    });

  }

  /**
   * Initialize the pointer position store
   * @internal
   */
  private initStore() {
    const store = this.store;

    const layer = new VectorLayer({
      isIgoInternalLayer: true,
      id: 'hoverFeatureId',
      title: 'hoverFeature',
      zIndex: 900,
      source: new FeatureDataSource(),
      showInLayerList: false,
      exportable: false,
      browsable: false,
      style: hoverFeatureMarkerStyle
    });
    tryBindStoreLayer(store, layer);

    this.selectionLayer = new olLayerVectorTile({
      map: this.map.ol,
      zIndex: 901,
      renderMode: "vector",
      declutter: true,
      source: new olVectorTileSource({projection: this.map.projection}),
      style: (feature, resolution) => {
        if (this.mvtStyleOptions && feature.getId() in this.selectionMVT) {
          return this.createHoverStyle(feature, this.mvtStyleOptions, resolution);
        }
      }
    });
  }

  createHoverStyle(feature: RenderFeature | OlFeature<OlGeometry>, hoverStyle: StyleByAttribute, resolution: number) {
    const localHoverStyle = { ...hoverStyle };
    let label = hoverStyle.label ? hoverStyle.label.attribute : undefined;
    let hasLabelStyle = hoverStyle.label?.style ? true : false;

    if (!feature.get('_isLabel')) {
      localHoverStyle.label = undefined;
      hasLabelStyle = false;
      label = undefined;
    } else {
      // clear the style for label....
      const size = localHoverStyle.data ? localHoverStyle.data.length : 0;
      const radius = [];
      const stroke = [];
      const width = [];
      const fill = [];
      for (let i = 0; i < size; i++) {
        radius.push(0);
        stroke.push('rgba(255, 255, 255, 0)');
        width.push(0);
        fill.push('rgba(255, 255, 255, 0)');
      }
      localHoverStyle.radius = radius;
      localHoverStyle.stroke = stroke;
      localHoverStyle.width = width;
      localHoverStyle.fill = fill;
    }
    if (!hasLabelStyle && label) {
      localHoverStyle.label.style =
      {
        textAlign: 'left',
        textBaseline: 'top',
        font: '12px Calibri,sans-serif',
        fill: { color: '#000' },
        backgroundFill: { color: 'rgba(255, 255, 255, 0.5)' },
        backgroundStroke: { color: 'rgba(200, 200, 200, 0.75)', width: 2 },
        stroke: { color: '#fff', width: 3 },
        overflow: true,
        offsetX: 10,
        offsetY: 20,
        padding: [2.5, 2.5, 2.5, 2.5]
      };
    }
    return this.styleService.createStyleByAttribute(feature, localHoverStyle, resolution);
  }

  /**
   * Stop listening to pointermove and reverse search results.
   * @internal
   */
  ngOnDestroy() {
    this.unlistenToMapPointerMove();
    this.unsubscribeToPointerStore();
    this.unlistenToMapSingleClick();
    this.layers$$.unsubscribe();
  }

  /**
   * Subscribe to pointermove result store
   * @internal
   */
  subscribeToPointerStore() {
    this.store$$ = this.pointerHoverFeatureStore.entities$.subscribe(resultsUnderPointerPosition => {
      this.addFeatureOverlay(resultsUnderPointerPosition);
    });
  }

  /**
   * On map pointermove
   */
  private listenToMapPointerMove() {
    this.pointerMoveListener = this.map.ol.on(
      'pointermove',
      (event: OlMapBrowserEvent<any>) => this.onMapEvent(event)
    );
  }

  /**
   * On map singleclick
   */
  private listenToMapClick() {
    this.singleClickMapListener = this.map.ol.on(
      'singleclick',
      (event: OlMapBrowserEvent<any>) => this.onMapSingleClickEvent(event)
    );
  }

  /**
   * Unsubscribe to pointer store.
   * @internal
   */
  unsubscribeToPointerStore() {
    this.store$$.unsubscribe();
  }

  /**
   * Stop listening for map pointermove
   * @internal
   */
  private unlistenToMapPointerMove() {
    unByKey(this.pointerMoveListener);
    this.pointerMoveListener = undefined;
  }

  /**
   * Stop listening for map singleclick
   * @internal
   */
  private unlistenToMapSingleClick() {
    unByKey(this.singleClickMapListener);
    this.singleClickMapListener = undefined;
  }

  /**
   * Trigger clear layer on singleclick.
   * @param event OL map browser singleclick event
   */
  private onMapSingleClickEvent(event: OlMapBrowserEvent<any>) {
    this.clearLayer();
  }

  /**
   * Trigger hover when the mouse is motionless during the defined delay (pointerMoveDelay).
   * @param event OL map browser pointer event
   */
  private onMapEvent(event: OlMapBrowserEvent<any>) {
    if (
      event.dragging || !this.igoHoverFeatureEnabled ||
      this.mediaService.isTouchScreen()) {
      this.clearLayer();
      return;
    }
    if (typeof this.lastTimeoutRequest !== 'undefined') { // cancel timeout when the mouse moves
      clearTimeout(this.lastTimeoutRequest);
    }
    let maximumZindex = -Infinity;
    let topMostOlLayer;
    const pixel = this.map.ol.getPixelFromCoordinate(event.coordinate);
    this.lastTimeoutRequest = setTimeout(() => {

      // retrieve the topmost layer with feature to only apply the hover on this layer.
      this.map.ol.forEachFeatureAtPixel(pixel, (mapFeature: RenderFeature | OlFeature<OlGeometry>, layerOL: any) => {
        if (!layerOL) {
          return;
        }
        const igoLayer = this.map.getLayerByOlUId((layerOL as any).ol_uid);
        if (!this.canProcessHover(igoLayer as any)) {
          return;
        }
        if (igoLayer.zIndex <= maximumZindex) {
          return;
        }
        maximumZindex = igoLayer.zIndex;
        topMostOlLayer = layerOL;

      }, {
        hitTolerance: 10, layerFilter: olLayer => olLayer instanceof olLayerVector || olLayer instanceof olLayerVectorTile
      });
      if (!topMostOlLayer) {
        // To clear label
        this.clearLayer();
        this.pointerHoverFeatureStore.clear();
        return;
      }

      this.map.ol.forEachFeatureAtPixel(pixel, (mapFeature: RenderFeature | OlFeature<OlGeometry>, layerOL: any) => {
        // To avoid flashing feature
        if (
          mapFeature.get('hoverSummary') === undefined &&
          mapFeature.getProperties() !== this.pointerHoverFeatureStore.all()[0]?.getProperties()
        ) {
          this.clearLayer();
          let igoLayer;
          if (layerOL instanceof olLayerVector) {
            const myOlLayerVector = this.map.getLayerByOlUId((layerOL as any).ol_uid) as VectorLayer;
            if (!this.canProcessHover(myOlLayerVector)) {
              return;
            }
            let localOlFeature = this.handleRenderFeature(mapFeature);
            this.setLayerStyleFromOptions(myOlLayerVector, localOlFeature);
            const featuresToLoad = [localOlFeature];
            localOlFeature.set("_isLabel", false);
            const myLabelOlFeature = new OlFeature();
            myLabelOlFeature.setProperties(localOlFeature.getProperties());
            const labelGeom =
              localOlFeature.getGeometry().getType() === 'Point' ? localOlFeature.getGeometry() : new OlGeom.Point(event.coordinate);
            myLabelOlFeature.setGeometry(labelGeom);
            myLabelOlFeature.setId(localOlFeature.getId());
            myLabelOlFeature.set("_isLabel", true);
            this.setLayerStyleFromOptions(myOlLayerVector, myLabelOlFeature);
            featuresToLoad.push(myLabelOlFeature);
            this.pointerHoverFeatureStore.load(featuresToLoad);
            igoLayer = myOlLayerVector;
            return true;
          }
          if (layerOL instanceof olLayerVectorTile) {
            const myOlLayerVectorTile = this.map.getLayerByOlUId((layerOL as any).ol_uid) as VectorTileLayer;
            if (!this.canProcessHover(myOlLayerVectorTile)) {
              return;
            }
            if (myOlLayerVectorTile?.options?.igoStyle?.styleByAttribute?.hoverStyle) {
              this.mvtStyleOptions = myOlLayerVectorTile.options.igoStyle.styleByAttribute.hoverStyle;
            } else if (myOlLayerVectorTile?.options?.igoStyle?.hoverStyle) {
              this.mvtStyleOptions = myOlLayerVectorTile.options.igoStyle.hoverStyle;
            }
            this.selectionLayer.setSource(layerOL.getSource());
            layerOL.getFeatures(event.pixel).then((mvtFeatures: (RenderFeature | OlFeature<OlGeometry>)[]) => {
              if (!mvtFeatures.length) {
                this.selectionMVT = {};
                this.selectionLayer.changed();
                this.clearLayer();
                return;
              }
              const feature = mvtFeatures[0];
              if (!feature) {
                this.clearLayer();
                return;
              }
              let localOlFeature = this.handleRenderFeature(feature);
              localOlFeature.set("_isLabel", false);
              const myLabelOlFeature = new OlFeature();
              myLabelOlFeature.setProperties(localOlFeature.getProperties());
              const labelGeom =
              localOlFeature.getGeometry().getType() === 'Point' ? localOlFeature.getGeometry() : new OlGeom.Point(event.coordinate);
              myLabelOlFeature.setGeometry(labelGeom);
              myLabelOlFeature.setId(localOlFeature.getId());
              myLabelOlFeature.set("_isLabel", true);
              this.setLayerStyleFromOptions(myOlLayerVectorTile, myLabelOlFeature);
              this.pointerHoverFeatureStore.load([myLabelOlFeature]);
              this.selectionMVT[feature.getId()] = localOlFeature;
              this.selectionLayer.changed();
            });
            igoLayer = myOlLayerVectorTile;
          }
        }
      }, {
        hitTolerance: 10, layerFilter: olLayer => olLayer === topMostOlLayer
      });
    }, this.igoHoverFeatureDelay);
  }

  canProcessHover(igoLayer: VectorLayer | VectorTileLayer): boolean {
    if (!igoLayer) {
      return false;
    }
    if (!igoLayer.visible) {
      return false;
    }
    if (!igoLayer.options) {
      return false;
    }

    if (!igoLayer.options.igoStyle?.styleByAttribute && !igoLayer.options.igoStyle?.hoverStyle) {
      return false;
    }

    if (
      (igoLayer.options.igoStyle?.styleByAttribute && !igoLayer.options.igoStyle?.styleByAttribute.hoverStyle) &&
      !igoLayer.options.igoStyle?.hoverStyle) {
      return false;
    }
    return true;
  }

  handleRenderFeature(feature: RenderFeature | OlFeature<OlGeometry>): OlFeature<OlGeometry> {
    let localFeature: OlFeature<OlGeometry>;
    if (feature instanceof RenderFeature) {
      localFeature = new OlFeature({
        geometry: this.getGeometry(feature)
      });
      localFeature.setId(feature.getId());
    } else if (feature instanceof OlFeature) {
      localFeature = feature;
    }
    localFeature.setProperties(feature.getProperties());
    return localFeature;
  }

  /**
   * Add a feature to the pointer store
   * @param text string
   */
  private addFeatureOverlay(hoverEntity: OlFeature<OlGeometry>[]) {

    if (hoverEntity.length > 0) {

      const result = hoverEntity[0];
      this.clearLayer();
      const feature = new OlFeature({
        geometry: result.getGeometry(),
        meta: { id: this.hoverFeatureId },
        hoverSummary: this.getHoverSummary(result.getProperties())
      });

      this.store.setLayerOlFeatures([feature], FeatureMotion.None);
    }
  }

  private setLayerStyleFromOptions(igoLayer: VectorLayer | VectorTileLayer, feature: OlFeature<OlGeometry>) {
    const resolution = this.store.layer.map.viewController.getResolution();
    if (igoLayer?.options?.igoStyle?.styleByAttribute?.hoverStyle) {
      this.store.layer.ol.setStyle(this.createHoverStyle(feature, igoLayer.options.igoStyle.styleByAttribute.hoverStyle, resolution));
      return;
    }
    if (igoLayer?.options?.igoStyle?.hoverStyle) {
      this.store.layer.ol.setStyle(this.createHoverStyle(feature, igoLayer.options.igoStyle.hoverStyle, resolution));
    }
  }

  private getHoverSummary(properties): string {
    let summary = '';
    for (const [key, value] of Object.entries(properties)) {
      if (!key.startsWith('_') && key !== 'geometry') {
        summary += `${key}: ${value}` + '\n';
      }
    }
    return summary.length >= 2 ? summary.slice(0, -2) : summary;
  }

  private getGeometry(feature): OlGeom.Geometry {
    let geom;
    if (!feature.getOrientedFlatCoordinates) {
      geom = feature.getGeometry();
    } else {

      const coords = feature.getOrientedFlatCoordinates();
      const flatCoords = [];

      coords.forEach((c, idx) => {
        if (idx % 2 === 0) {
          flatCoords.push([parseFloat(coords[idx]), parseFloat(coords[idx + 1])]);
        }
      });

      // TODO: test MultiX
      switch (feature.getType()) {
        case 'Point':
          geom = new OlGeom.Point(flatCoords);
          break;
        case 'Polygon':
          geom = new OlGeom.Polygon([flatCoords]);
          break;
        case 'LineString':
          geom = new OlGeom.LineString([flatCoords]);
          break;
      }
    }

    return geom;
  }


  /**
   * Clear the pointer store features
   */
  private clearLayer() {
    this.selectionMVT = {};
    if (this.selectionLayer) {
      this.selectionLayer.changed();
    }
    if (this.store) {
      this.store.clearLayer();
    }
  }
}

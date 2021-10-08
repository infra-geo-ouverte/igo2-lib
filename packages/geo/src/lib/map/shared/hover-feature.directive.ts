import {
    Directive,
    Input,
    OnDestroy,
    Self,
    OnInit,
    HostListener
  } from '@angular/core';

import { Subscription } from 'rxjs';

import type { default as OlMapBrowserEvent } from 'ol/MapBrowserEvent';

import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { Feature } from '../../feature/shared/feature.interfaces';

import olFeature from 'ol/Feature';
import * as olstyle from 'ol/style';
import * as olgeom from 'ol/geom';
import * as olLayer from 'ol/layer';

import { EntityStore } from '@igo2/common';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { VectorLayer, Layer } from '../../layer/shared/layers';
import { take } from 'rxjs/operators';
import { tryBindStoreLayer } from '../../feature/shared/feature.utils';
import { FeatureStore } from '../../feature/shared/store';
import { FeatureMotion } from '../../feature/shared/feature.enums';
import { MediaService } from '@igo2/core';
import { StyleService } from '../../layer/shared/style.service';
import { unByKey } from 'ol/Observable';

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
  private pointerHoverFeatureStore: EntityStore<any> = new EntityStore<any>([]);
  private lastTimeoutRequest;
  private store$$: Subscription;
  private layers$$: Subscription;

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
      this.store = new FeatureStore<Feature>([], {map: this.map});
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
  private initStore(layerSource?: Layer) {
    const store = this.store;

    const layer = new VectorLayer({
      id : 'hoverFeatureId',
      title: 'hoverFeature',
      zIndex: 900,
      source: new FeatureDataSource(),
      showInLayerList: false,
      exportable: false,
      browsable: false,
      style: hoverFeatureMarker
    });
    tryBindStoreLayer(store, layer);
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
      this.entitiesToPointerOverlay(resultsUnderPointerPosition);
    });
  }

  /**
   * convert store entities to a pointer position overlay with label summary on.
   * @param event OL map browser pointer event
   */
  private entitiesToPointerOverlay(resultsUnderPointerPosition: any[]) {

    this.addFeatureOverlay(resultsUnderPointerPosition);

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
  private onMapSingleClickEvent(event: OlMapBrowserEvent<any>){
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

    const pixel = this.map.ol.getPixelFromCoordinate(event.coordinate);
    this.lastTimeoutRequest = setTimeout(() => {

      this.map.ol.forEachFeatureAtPixel(pixel, function(f, l) {
        if (f.get('hoverSummary') === undefined) {
          const igoLayer: VectorLayer = this.map.getLayerByOlUId(l.ol_uid);
          this.setLayerStyleFromOptions(igoLayer, f);
          this.pointerHoverFeatureStore.load([{layer: igoLayer, feature: f}]);
        }
        return true;
      }.bind(this));
    }, this.igoHoverFeatureDelay);
  }

  /**
   * Add a feature to the pointer store
   * @param text string
   */
  private addFeatureOverlay(results) {

    if (results.length > 0 ) {

      results = results[0];
      this.clearLayer();
      let geom = this.getGeometry(results.feature) as any;

      // si vector tile, merge avec les polygones voisins possiblement meme entité
      if (results.layer.ol instanceof olLayer.VectorTile) {
        geom = [geom];
        const neighbourCollection = this.getSameFeatureNeighbour(results.feature, results.layer);

        neighbourCollection.forEach( (n) => {
          geom.push(n.getGeometry());
        });
      }

      const feature = new olFeature({
        geometry: geom instanceof Array ? new olgeom.GeometryCollection(geom) : geom,
        meta: {id: this.hoverFeatureId},
        hoverSummary: this.getHoverSummary(results.feature.getProperties())
      });

      this.store.setLayerOlFeatures([feature], FeatureMotion.None);
    }
  }

  private setLayerStyleFromOptions(igoLayer: VectorLayer, feat) {
    if ( igoLayer.options?.styleByAttribute?.hoverStyle) {
      this.store.layer.ol.setStyle(this.styleService.createStyleByAttribute(feat, igoLayer.options.styleByAttribute.hoverStyle));
    } else {
      this.store.layer.ol.setStyle(hoverFeatureMarker);
    }
  }

  private getHoverSummary(properties): string{
    let summary = '';
    for (const [key, value] of Object.entries(properties)) {
      summary += `${key}: ${value}` + '\n';
    }
    return summary;
  }

  private getGeometry(feature): olgeom.Geometry {
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
          geom = new olgeom.Point(flatCoords);
          break;
        case 'Polygon':
          geom = new olgeom.Polygon([flatCoords]);
          break;
        case 'LineString':
          geom = new olgeom.LineString([flatCoords]);
          break;
      }
    }

    return geom;
  }

  private getSameFeatureNeighbour(feature, layer, neighbourCollection: olFeature<olgeom.Geometry>[] = []) {

    if (neighbourCollection.length === 0) {
      neighbourCollection.push(
        new olFeature({
          geometry: this.getGeometry(feature),
          meta: {id: this.hoverFeatureId}
        })
      );
    }

    const toDoNeighbour = [];
    const neighbourFeatures = layer.ol.getSource().getFeaturesInExtent(feature.getGeometry().getExtent());

    neighbourFeatures.forEach(f => {

      const checkIf = neighbourCollection.find(x => {
        return x === f;
      });

      if (f.getId() === feature.getId() && !checkIf) {
        toDoNeighbour.push(f);
        neighbourCollection.push(f);
      }
    });

    return neighbourCollection.map(f => {
      return new olFeature({
        geometry: this.getGeometry(f),
        meta: {id: this.hoverFeatureId}
      });
    });
  }

  /**
   * Clear the pointer store features
   */
  private clearLayer() {
    if (this.store) {
      this.store.clearLayer();
    }
  }
}

/**
 * Create a default style for the pointer position and it's label summary.
 * @param feature OlFeature
 * @returns OL style function
 */
export function hoverFeatureMarker(feature: olFeature<olgeom.Geometry>, resolution: number): olstyle.Style[] {

  const olStyleText = new olstyle.Style({
    text: new olstyle.Text({
      text: feature.get('hoverSummary'),
      textAlign: 'left',
      textBaseline: 'bottom',
      font: '12px Calibri,sans-serif',
      fill: new olstyle.Fill({ color: '#000' }),
      backgroundFill: new olstyle.Fill({ color: 'rgba(255, 255, 255, 0.5)' }),
      backgroundStroke: new olstyle.Stroke({ color: 'rgba(200, 200, 200, 0.75)', width: 2 }),
      stroke: new olstyle.Stroke({ color: '#fff', width: 3 }),
      overflow: true,
      offsetX: 10,
      offsetY: -10,
      padding: [2.5, 2.5, 2.5, 2.5]
    })
  });

  const olStyle = [olStyleText];
  switch (feature.getGeometry().getType()) {
    case 'Point':
      olStyle.push(new olstyle.Style({
        image: new olstyle.Circle({
          radius: 10,
          stroke: new olstyle.Stroke({
            color: 'blue',
            width: 3
          })
        })
      }));
      break;
    default:
      olStyle.push(new olstyle.Style({
        stroke: new olstyle.Stroke({
          color: 'white',
          width: 5
        })
      }));
      olStyle.push(new olstyle.Style({
        stroke: new olstyle.Stroke({
          color: 'blue',
          width: 3
        })
      }));
  }

  return olStyle;

}

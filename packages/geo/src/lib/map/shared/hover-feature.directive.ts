import {
    Directive,
    Input,
    OnDestroy,
    Self,
    OnInit,
    HostListener,
    AfterContentChecked,
    Testability
  } from '@angular/core';
  
  import { Subscription } from 'rxjs';
  
  import { MapBrowserPointerEvent as OlMapBrowserPointerEvent } from 'ol/MapBrowserEvent';
  import { ListenerFunction } from 'ol/events';
  
  import { IgoMap } from '../../map/shared/map';
  import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
  import { Feature } from '../../feature/shared/feature.interfaces';
  //import { SearchService } from './search.service';
  
  import olFeature from 'ol/Feature';
  import { transform } from 'ol/proj';
  import * as olstyle from 'ol/style';
  import * as olgeom from 'ol/geom';
  import * as olLayer from 'ol/layer';
  import * as olFormat from 'ol/format';

  import union from '@turf/union';
  
  //import { SearchResult, Research } from './search.interfaces';
  import { EntityStore } from '@igo2/common';
  import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
  import { FeatureDataSourceOptions } from '../../datasource/shared/datasources/feature-datasource.interface';
  import { VectorLayer, VectorTileLayer } from '../../layer/shared/layers';
  import { take } from 'rxjs/operators';
  import { tryBindStoreLayer } from '../../feature/shared/feature.utils';
  import { FeatureStore } from '../../feature/shared/store';
  import { FeatureMotion, FEATURE } from '../../feature/shared/feature.enums';
  //import { SearchSourceService } from './search-source.service';
  //import { sourceCanReverseSearchAsSummary } from './search.utils';
  import { MediaService } from '@igo2/core';
import { CoordinatesSearchResultFormatter } from '../../search';
  
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
    private lonLat: [number, number];
    private pointerHoverFeatureStore: EntityStore<any> = new EntityStore<any>([]);
    private lastTimeoutRequest;
    private store$$: Subscription;
    private layers$$: Subscription;
  
    /**
     * Listener to the pointer move event
     */
    private pointerMoveListener: ListenerFunction;
  
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
      private mediaService: MediaService
    ) { }
  
    /**
     * Start listening to pointermove and reverse search results.
     * @internal
     */
    ngOnInit() {
      this.listenToMapPointerMove();
      this.subscribeToPointerStore();
  
      this.map.status$.pipe(take(1)).subscribe(() => {
        this.store = new FeatureStore<Feature>([], {map: this.map});
        this.initStore();
      });
  
      // To handle context change without using the contextService.
      this.layers$$ = this.map.layers$.subscribe((layers) => {
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
      
      //const test: FeatureDataSourceOptions = {formatType: 'GeoJSON', formatOptions: {dataProjection: 'EPSG:3857', featureProjection: 'EPSG:3857'}};

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
        (event: OlMapBrowserPointerEvent) => this.onMapEvent(event)
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
      this.map.ol.un(this.pointerMoveListener.type, this.pointerMoveListener.listener);
      this.pointerMoveListener = undefined;
    }
  
    /**
     * Trigger reverse search when the mouse is motionless during the defined delay (pointerMoveDelay).
     * @param event OL map browser pointer event
     */
    private onMapEvent(event: OlMapBrowserPointerEvent) {
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

        this.map.ol.forEachFeatureAtPixel(pixel, function (f, l) {
          if(f.get('hoverSummary') === undefined){
            this.pointerHoverFeatureStore.load([{layer:l, feature:f}]);
          }
          return true;
        }.bind(this))
      }, this.igoHoverFeatureDelay);
    }
  
    /**
     * Add a feature to the pointer store
     * @param text string
     */
    private addFeatureOverlay(results) {

      if(results.length > 0 ){

        results = results[0];
    
          this.clearLayer();

          let geom = this.getGeometry(results.feature);

          // si vector tile, merge avec les polygones voisins possiblement meme entité
          if(results.layer instanceof olLayer.VectorTile){
            geom = [geom];
            const neighbourCollection = this.getMergeWithNeighbourFeatures(results.feature, results.layer);
            let formatGeoJSON = new olFormat.GeoJSON();
            let test = formatGeoJSON.writeFeatureObject(neighbourCollection[0]);
            neighbourCollection.forEach( (n,idx) => {
              geom.push(n.getGeometry());
              if (idx != 1) {
                const nTurf = formatGeoJSON.writeFeatureObject(n);
                // crash le browser =\
                //test = union(test,nTurf);
              }
            })
          }

          let feature = new olFeature({
            geometry: geom instanceof Array ? new olgeom.GeometryCollection(geom) : geom, 
            meta: {id: this.hoverFeatureId}, 
            hoverSummary: this.getHoverSummary(results.feature.getProperties())
          });

          this.store.setLayerOlFeatures([feature], FeatureMotion.None);
        
      }      
    }
  
  private getHoverSummary(properties): string{
    let summary = '';
    for (const [key, value] of Object.entries(properties)) {
      summary += `${key}: ${value}`+ '\n';
    }
    return summary;
  }

  private getGeometry(feature): olgeom {
    let geom;
    if(!feature.getFlatCoordinates){
      geom = feature.getGeometry();
    } else {

      const coords = feature.getFlatCoordinates();
      const polyCoords = [];

      coords.forEach((c,idx) => {
        if(idx%2===0){
          polyCoords.push([parseFloat(coords[idx]), parseFloat(coords[idx+1])]);
        }
      });

      switch(feature.getType()){
        case 'Point':
          geom = new olgeom.Point([polyCoords]);
          break;
        case 'Polygon':
          geom = new olgeom.Polygon([polyCoords]);
          break;
      }
      
    }

    return geom;
  }

  private getMergeWithNeighbourFeatures (feature, layer) {
    const neighbourCollection = [];
    const neighbourFeatures = layer.getSource().getFeaturesInExtent(feature.getExtent());
    neighbourFeatures.forEach(f => {
      if(f.getId() === feature.getId()){

        const feature = new olFeature({
          geometry: this.getGeometry(f), 
          meta: {id: this.hoverFeatureId}
        });

        neighbourCollection.push(feature);
      }
    });

    return neighbourCollection;
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
  export function hoverFeatureMarker(feature: olFeature, resolution: number): olstyle.Style {
    return [new olstyle.Style({
      stroke: new olstyle.Stroke({
        color: "white",
        width: 5
      })
    }),
    new olstyle.Style({
      stroke: new olstyle.Stroke({
        color: "blue",
        width: 3
      })
    }),
    new olstyle.Style({
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
    })];
    
    
     /* new olstyle.Style({
        image: new olstyle.Icon({
          src: './assets/igo2/geo/icons/cross_black_18px.svg',
          imgSize: [18, 18], // for ie
        }),
        text: new olstyle.Text({
          text: feature.get('pointerSummary'),
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
      */
  }
  
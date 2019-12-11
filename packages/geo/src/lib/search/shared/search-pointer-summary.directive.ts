import {
  Directive,
  Input,
  OnDestroy,
  Self,
  OnInit,
  HostListener
} from '@angular/core';

import { Subscription } from 'rxjs';

import { MapBrowserPointerEvent as OlMapBrowserPointerEvent } from 'ol/MapBrowserEvent';
import { ListenerFunction } from 'ol/events';

import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { Feature } from '../../feature/shared/feature.interfaces';
import { SearchService } from './search.service';

import olFeature from 'ol/Feature';
import { transform } from 'ol/proj';
import * as olstyle from 'ol/style';
import * as olgeom from 'ol/geom';

import { SearchResult, Research } from './search.interfaces';
import { EntityStore } from '@igo2/common';
import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { take } from 'rxjs/operators';

/**
 * This directive makes a map queryable with a click of with a drag box.
 * By default, all layers are queryable but this can ben controlled at
 * the layer level.
 */
@Directive({
  selector: '[igoSearchPointerSummary]'
})
export class SearchPointerSummaryDirective implements OnInit, OnDestroy {

  private lonLat: [number, number];
  private pointerSearchStore: EntityStore<SearchResult> = new EntityStore<SearchResult>([]);
  private lastTimeoutRequest;
  private store$$: Subscription;
  private reverseSearch$$: Subscription[] = [];

  /**
   * Listener to the map click event
   */
  private pointerMoveListener: ListenerFunction;

  private pointerPositionDataSource: FeatureDataSource;
  private pointerPositionLayer;
  private searchPointerSummaryFeatureId: string = 'searchPointerSummaryFeatureId';
  /**
   * Whether all query should complete before emitting an event
   */
  @Input() pointerMoveDelay: number = 1000;

  @HostListener('mouseout')
  mouseout() {
    clearTimeout(this.lastTimeoutRequest);
    this.deletePointerFeature();
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
    private searchService: SearchService
  ) { }

  /**
   * Start listening to click and drag box events
   * @internal
   */
  ngOnInit() {
    this.listenToMapPointerMove();
    this.subscribeToPointerStore();

    this.pointerPositionDataSource = new FeatureDataSource({});

    this.pointerPositionLayer = new VectorLayer({
      title: 'searchPointerSummary',
      zIndex: 999,
      id: 'searchPointerSummaryId',
      source: this.pointerPositionDataSource,
      showInLayerList: true
    });

    this.map.status$.pipe(take(1)).subscribe(() => this.map.addLayer(this.pointerPositionLayer));

  }

  /**
   * Stop listening to click and drag box events and cancel ongoind requests
   * @internal
   */
  ngOnDestroy() {
    this.unlistenToMapPointerMove();
    this.unsubscribeToPointerStore();

    this.map.removeLayer(this.pointerPositionLayer);
  }

  subscribeToPointerStore() {
    this.store$$ = this.pointerSearchStore.entities$.subscribe(positions => {
      const summary = [];
      positions.map(position => summary.push(position.meta.title));
      if (positions.length) {
        this.addPointerOverlay(summary.join('\n'));
      }
    });
  }

  /**
   * On map click, issue queries
   */
  private listenToMapPointerMove() {
    this.pointerMoveListener = this.map.ol.on(
      'pointermove',
      (event: OlMapBrowserPointerEvent) => this.onMapEvent(event)
    );
  }

  unsubscribeToPointerStore() {
    this.store$$.unsubscribe();
  }

  unsubscribeReverseSearch() {
    this.reverseSearch$$.map(s => s.unsubscribe());
    this.reverseSearch$$ = [];
  }

  /**
   * Stop listening for map clicks
   */
  private unlistenToMapPointerMove() {
    this.map.ol.un(this.pointerMoveListener.type, this.pointerMoveListener.listener);
    this.pointerMoveListener = undefined;
  }

  /**
   * Issue queries from a map event and emit events with the results
   * @param event OL map browser pointer event
   */
  private onMapEvent(event: OlMapBrowserPointerEvent) {
    if (event.dragging) { return; }
    if (typeof this.lastTimeoutRequest !== 'undefined') { // cancel timeout when the mouse moves
      clearTimeout(this.lastTimeoutRequest);
      this.deletePointerFeature();
      this.unsubscribeReverseSearch();
    }

    this.lonLat = transform(event.coordinate, this.mapProjection, 'EPSG:4326');

    this.lastTimeoutRequest = setTimeout(() => {
      this.onSearchCoordinate();
    }, this.pointerMoveDelay);
  }

  private onSearchCoordinate() {
    this.pointerSearchStore.clear();
    const results = this.searchService.reverseSearch(this.lonLat, { params: { geometry: 'false', icon: 'false' } });

    for (const i in results) {
      if (results.length > 0) {
        this.reverseSearch$$.push(
          results[i].request.subscribe((_results: SearchResult<Feature>[]) => {
            this.onSearch({ research: results[i], results: _results });
          }));
      }
    }
  }

  private onSearch(event: { research: Research; results: SearchResult[] }) {
    const results = event.results;
    const newResults = this.pointerSearchStore.all()
      .filter((result: SearchResult) => result.source !== event.research.source)
      .concat(results);
    this.pointerSearchStore.load(newResults);
  }

  private addPointerOverlay(text) {
    this.deletePointerFeature();

    const geometry = new olgeom.Point(
      transform(this.lonLat, 'EPSG:4326', this.mapProjection)
    );
    const feature = new olFeature({ geometry });
    feature.setId(this.searchPointerSummaryFeatureId);

    const olStyle = this.pointerPositionSummaryMarker({ text });
    feature.setStyle(olStyle);
    this.pointerPositionDataSource.ol.addFeature(feature);

  }

  private deletePointerFeature() {
    const localPointerCoordLonLatFeature = this.pointerPositionDataSource.ol.getFeatureById(this.searchPointerSummaryFeatureId);
    if (localPointerCoordLonLatFeature) {
      this.pointerPositionDataSource.ol.removeFeature(localPointerCoordLonLatFeature);
    }
  }

  private pointerPositionSummaryMarker(
    { text, opacity = 1 }:
      { text?: string, opacity?: number } = {}
  ): olstyle.Style {

    return new olstyle.Style({
      image: new olstyle.Icon({
        src: './assets/igo2/geo/icons/cross_black_18px.svg',
        opacity,
        imgSize: [18, 18], // for ie
      }),

      text: new olstyle.Text({
        text,
        textAlign: 'left',
        textBaseline: 'bottom',
        font: '12px Calibri,sans-serif',
        fill: new olstyle.Fill({ color: '#000' }),
        backgroundFill: new olstyle.Fill({ color: 'rgba(255, 255, 255, 0.65)' }),
        stroke: new olstyle.Stroke({ color: '#fff', width: 3 }),
        overflow: true,
        offsetX: 5,
        offsetY: -2.5
      })
    });
  }

}

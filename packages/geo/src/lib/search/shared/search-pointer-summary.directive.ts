import {
  Directive,
  Input,
  OnDestroy,
  Self,
  OnInit
} from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { MapBrowserPointerEvent as OlMapBrowserPointerEvent } from 'ol/MapBrowserEvent';
import { ListenerFunction } from 'ol/events';

import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { Feature } from '../../feature/shared/feature.interfaces';
import { SearchService } from './search.service';

import { transform } from 'ol/proj';
import { EntityStore } from '@igo2/common';
import { SearchResult, Research } from './search.interfaces';
import { FEATURE, FeatureMotion } from '../../feature/shared/feature.enums';

/**
 * This directive makes a map queryable with a click of with a drag box.
 * By default, all layers are queryable but this can ben controlled at
 * the layer level.
 */
@Directive({
  selector: '[igoSearchPointerSummary]'
})
export class SearchPointerSummaryDirective implements OnInit, OnDestroy {

  private lonLat: [ number, number]
  private computedSummary$: BehaviorSubject<string> = new BehaviorSubject('');
  public pointerSearchStore = new EntityStore<SearchResult>([]);
  public lastTimeoutRequest;

  /**
   * Listener to the map click event
   */
  private pointerMoveListener: ListenerFunction;

  /**
   * Whether all query should complete before emitting an event
   */
  @Input() pointerMoveDelay: number = 1000;

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
    this.pointerSearchStore.entities$.subscribe(positions => {
     //  console.log('positions', positions)
      const summary = []
      positions.map(position => summary.push(position.meta.title));

      console.log(summary.join('\n'))
     



      if (positions.length) {
       // this.computedSummary$.next(summary.join('\n'))
       this.addPointerOverlay(summary.join('\n') );
      }
    });
  }

  /**
   * Stop listening to click and drag box events and cancel ongoind requests
   * @internal
   */
  ngOnDestroy() {
    // this.cancelOngoingQueries();
    this.unlistenToMapPointerMove();
  }

  /**
   * On map click, issue queries
   */
  private listenToMapPointerMove() {
    this.pointerMoveListener = this.map.ol.on(
      'pointermove',
      (event: OlMapBrowserPointerEvent) => this.onMapEvent(event, this.pointerMoveDelay)
    );
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
  private onMapEvent(event: OlMapBrowserPointerEvent, delay: number) {
    if (event.dragging) { return; }
    if (typeof this.lastTimeoutRequest !== 'undefined') { // cancel timeout when the mouse moves
      clearTimeout(this.lastTimeoutRequest);
    }

    this.lonLat = transform(event.coordinate, this.mapProjection, 'EPSG:4326');
    this.lastTimeoutRequest = setTimeout(() => {
      // this.addPointerOverlay(lonlat);
      this.onSearchCoordinate();
    }, delay);
  }

  private onSearchCoordinate() {
    this.pointerSearchStore.clear();
    const results = this.searchService.reverseSearch(this.lonLat);

    for (const i in results) {
      if (results.length > 0) {
        results[i].request.subscribe((_results: SearchResult<Feature>[]) => {
          this.onSearch({ research: results[i], results: _results });
        });
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

    const pointerFeature = {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry: {
          type: 'Point',
          coordinates: this.lonLat
        },
        meta: {
          id: 'pointerCoordLonLat',
          mapTitle: text
        }
      
    }
    this.map.overlay.setFeatures([pointerFeature as any], FeatureMotion.None );
    };
  
}

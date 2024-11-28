import {
  AfterContentChecked,
  Directive,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Self
} from '@angular/core';

import { EntityStore } from '@igo2/common/entity';
import { MediaService } from '@igo2/core/media';
import { SubjectStatus } from '@igo2/utils';

import olFeature from 'ol/Feature';
import MapBrowserPointerEvent from 'ol/MapBrowserEvent';
import { unByKey } from 'ol/Observable';
import OlGeoJSON from 'ol/format/GeoJSON';
import * as olgeom from 'ol/geom';
import { transform } from 'ol/proj';

import { Subscription, first } from 'rxjs';

import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import { tryBindStoreLayer } from '../../feature/shared/feature-store.utils';
import { FEATURE, FeatureMotion } from '../../feature/shared/feature.enums';
import { Feature } from '../../feature/shared/feature.interfaces';
import { FeatureStore } from '../../feature/shared/store';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { IgoMap } from '../../map/shared/map';
import { pointerPositionSummaryMarkerStyle } from '../../style/shared/feature/feature-style';
import { FeatureGeometry } from './../../feature/shared/feature.interfaces';
import { SearchSourceService } from './search-source.service';
import { Research, SearchResult } from './search.interfaces';
import { SearchService } from './search.service';
import { sourceCanReverseSearchAsSummary } from './search.utils';

/**
 * This directive makes the mouse coordinate trigger a reverse search on available search sources.
 * The search results are placed into a label, on a cross icon, representing the mouse coordinate.
 * By default, no search sources. Config in config file must be defined.
 * the layer level.
 */
@Directive({
  selector: '[igoSearchPointerSummary]',
  standalone: true
})
export class SearchPointerSummaryDirective
  implements OnInit, OnDestroy, AfterContentChecked
{
  public store: FeatureStore<Feature>;
  private lonLat: [number, number];
  private pointerSearchStore: EntityStore<SearchResult> =
    new EntityStore<SearchResult>([]);
  private lastTimeoutRequest;
  private store$$: Subscription;
  private layers$$: Subscription;
  private reverseSearch$$: Subscription[] = [];
  private hasPointerReverseSearchSource = false;

  /**
   * Listener to the pointer move event
   */
  private pointerMoveListener;

  private searchPointerSummaryFeatureId = 'searchPointerSummaryFeatureId';
  /**
   * The delay where the mouse must be motionless before trigger the reverse search
   */
  @Input() igoSearchPointerSummaryDelay = 1000;

  /**
   * If the user has enabled or not the directive
   */
  @Input() igoSearchPointerSummaryEnabled = false;

  @HostListener('mouseleave')
  mouseleave() {
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
    private searchService: SearchService,
    private searchSourceService: SearchSourceService,
    private mediaService: MediaService
  ) {}

  /**
   * Start listening to pointermove and reverse search results.
   * @internal
   */
  ngOnInit() {
    this.listenToMapPointerMove();

    this.map.status$
      .pipe(first((status) => status === SubjectStatus.Done))
      .subscribe(() => {
        this.store = new FeatureStore<Feature>([], { map: this.map });
        this.initStore();
        this.subscribeToPointerStore();
      });

    // To handle context change without using the contextService.
    this.layers$$ = this.map.layers$.subscribe((layers) => {
      if (
        this.store &&
        !layers.find((l) => l.id === 'searchPointerSummaryId')
      ) {
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
      id: 'searchPointerSummaryId',
      title: 'searchPointerSummary',
      zIndex: 900,
      source: new FeatureDataSource(),
      showInLayerList: false,
      exportable: false,
      browsable: false,
      style: pointerPositionSummaryMarkerStyle
    });
    tryBindStoreLayer(store, layer);
  }

  ngAfterContentChecked(): void {
    if (
      !this.searchSourceService
        .getEnabledSources()
        .filter(sourceCanReverseSearchAsSummary).length
    ) {
      this.hasPointerReverseSearchSource = false;
    } else {
      this.hasPointerReverseSearchSource = true;
    }
  }

  /**
   * Stop listening to pointermove and reverse search results.
   * @internal
   */
  ngOnDestroy() {
    this.unlistenToMapPointerMove();
    this.unsubscribeToPointerStore();
    this.unsubscribeReverseSearch();
    this.layers$$?.unsubscribe();
  }

  /**
   * Subscribe to pointermove result store
   * @internal
   */
  subscribeToPointerStore() {
    this.store$$ = this.pointerSearchStore.entities$.subscribe(
      (resultsUnderPointerPosition) => {
        this.entitiesToPointerOverlay(resultsUnderPointerPosition);
      }
    );
  }

  /**
   * Build an object based on the closest feature by type (base on type and distance properties )
   * @param results SearchResult[]
   * @returns OL style function
   */
  private computeSummaryClosestFeature(results: SearchResult[]) {
    const closestResultByType = {};

    results.map((result) => {
      if (result.data.properties.type && result.data.properties.distance >= 0) {
        // eslint-disable-next-line no-prototype-builtins
        if (closestResultByType.hasOwnProperty(result.data.properties.type)) {
          const prevDistance =
            closestResultByType[result.data.properties.type].distance;
          if (result.data.properties.distance < prevDistance) {
            const title = result.meta.pointerSummaryTitle || result.meta.title;
            closestResultByType[result.data.properties.type] = {
              distance: result.data.properties.distance,
              title
            };
          }
        } else {
          const title = result.meta.pointerSummaryTitle || result.meta.title;
          closestResultByType[result.data.properties.type] = {
            distance: result.data.properties.distance,
            title
          };
        }
      }
    });

    return closestResultByType;
  }

  /**
   * convert store entities to a pointer position overlay with label summary on.
   * @param event OL map browser pointer event
   */
  private entitiesToPointerOverlay(
    resultsUnderPointerPosition: SearchResult[]
  ) {
    const closestResultByType = this.computeSummaryClosestFeature(
      resultsUnderPointerPosition
    );
    const summarizedClosestType = Object.keys(closestResultByType);
    const processedSummarizedClosestType = [];
    const summary = [];
    resultsUnderPointerPosition.map((result) => {
      const typeIndex = summarizedClosestType.indexOf(
        result.data.properties.type
      );
      if (typeIndex !== -1) {
        summary.push(closestResultByType[result.data.properties.type].title);
        summarizedClosestType.splice(typeIndex, 1);
        processedSummarizedClosestType.push(result.data.properties.type);
      } else {
        if (
          processedSummarizedClosestType.indexOf(
            result.data.properties.type
          ) === -1
        ) {
          summary.push(result.meta.pointerSummaryTitle || result.meta.title);
        }
      }
    });
    if (summary.length) {
      this.addPointerOverlay(summary.join('\n'));
    }
  }

  /**
   * On map pointermove
   */
  private listenToMapPointerMove() {
    this.pointerMoveListener = this.map.ol.on(
      'pointermove',
      (event: MapBrowserPointerEvent<any>) => this.onMapEvent(event)
    );
  }

  /**
   * Unsubscribe to pointer store.
   * @internal
   */
  unsubscribeToPointerStore() {
    this.store$$?.unsubscribe();
  }
  /**
   * Unsubscribe to reverse seatch store.
   * @internal
   */
  unsubscribeReverseSearch() {
    this.reverseSearch$$.map((s) => s.unsubscribe());
    this.reverseSearch$$ = [];
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
   * Trigger reverse search when the mouse is motionless during the defined delay (pointerMoveDelay).
   * @param event OL map browser pointer event
   */
  private onMapEvent(event: MapBrowserPointerEvent<any>) {
    if (
      event.dragging ||
      !this.igoSearchPointerSummaryEnabled ||
      !this.hasPointerReverseSearchSource ||
      this.mediaService.isTouchScreen()
    ) {
      this.clearLayer();
      return;
    }
    if (typeof this.lastTimeoutRequest !== 'undefined') {
      // cancel timeout when the mouse moves
      clearTimeout(this.lastTimeoutRequest);
      this.clearLayer();
      this.unsubscribeReverseSearch();
    }

    this.lonLat = transform(
      event.coordinate,
      this.mapProjection,
      'EPSG:4326'
    ) as [number, number];

    this.lastTimeoutRequest = setTimeout(() => {
      this.onSearchCoordinate();
    }, this.igoSearchPointerSummaryDelay);
  }

  /**
   * Sort the results by display order.
   * @param r1 First result
   * @param r2 Second result
   */
  private sortByOrder(r1: SearchResult, r2: SearchResult) {
    return r1.source.displayOrder - r2.source.displayOrder;
  }

  private onSearchCoordinate() {
    this.pointerSearchStore.clear();
    const results = this.searchService.reverseSearch(
      this.lonLat,
      { params: { geometry: 'false', icon: 'false' } },
      true
    );

    for (const i in results) {
      if (results.length > 0) {
        this.reverseSearch$$.push(
          results[i].request.subscribe((_results: SearchResult<Feature>[]) => {
            this.onSearch({ research: results[i], results: _results });
          })
        );
      }
    }
  }

  private onSearch(event: { research: Research; results: SearchResult[] }) {
    const results = event.results;
    const newResults = this.pointerSearchStore
      .all()
      .filter((result: SearchResult) => result.source !== event.research.source)
      .concat(results);
    this.pointerSearchStore.load(newResults.sort(this.sortByOrder));
  }

  /**
   * Add a feature to the pointer store
   * @param text string
   */
  private addPointerOverlay(text: string) {
    this.clearLayer();

    const geometry = new olgeom.Point(
      transform(this.lonLat, 'EPSG:4326', this.mapProjection)
    );
    const feature = new olFeature({ geometry });
    const geojsonGeom = new OlGeoJSON().writeGeometryObject(geometry, {
      featureProjection: this.mapProjection,
      dataProjection: this.mapProjection
    }) as FeatureGeometry;

    const f: Feature = {
      type: FEATURE,
      geometry: geojsonGeom,
      projection: this.mapProjection,
      properties: {
        id: this.searchPointerSummaryFeatureId,
        pointerSummary: text
      },
      meta: {
        id: this.searchPointerSummaryFeatureId
      },
      ol: feature
    };
    this.store.setLayerFeatures([f], FeatureMotion.None);
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

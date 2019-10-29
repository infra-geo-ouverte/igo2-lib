import {
  Directive,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  Self
} from '@angular/core';

import { Subscription, Observable, of, zip } from 'rxjs';

import OlFeature from 'ol/Feature';
import OlLayer from 'ol/layer/Layer';

import OlDragBoxInteraction from 'ol/interaction/DragBox';
import { MapBrowserPointerEvent as OlMapBrowserPointerEvent } from 'ol/MapBrowserEvent';
import { ListenerFunction } from 'ol/events';

import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { Feature } from '../../feature/shared/feature.interfaces';
import { featureFromOl } from '../../feature/shared/feature.utils';
import { QueryService } from './query.service';
import { layerIsQueryable, olLayerIsQueryable } from './query.utils';
import { AnyLayer } from '../../layer/shared/layers/any-layer';

/**
 * This directive makes a map queryable with a click of with a drag box.
 * By default, all layers are queryable but this cna ben controlled at
 * the layer level.
 */
@Directive({
  selector: '[igoQuery]'
})
export class QueryDirective implements AfterViewInit, OnDestroy {
  /**
   * Subscriptions to ongoing queries
   */
  private queries$$: Subscription[] = [];

  /**
   * Listener to the map click event
   */
  private mapClickListener: ListenerFunction;

  /**
   * OL drag box interaction
   */
  private olDragBoxInteraction: OlDragBoxInteraction;

  /**
   * Ol drag box "end" event key
   */
  private olDragBoxInteractionEndKey: string;

  /**
   * Whter to query features or not
   */
  @Input() queryFeatures: boolean = false;

  /**
   * Feature query hit tolerance
   */
  @Input() queryFeaturesHitTolerance: number = 0;

  /**
   * Feature query hit tolerance
   */
  @Input() queryFeaturesCondition: (olLayer: OlLayer) => boolean;

  /**
   * Whether all query should complete before emitting an event
   */
  @Input() waitForAllQueries: boolean = true;

  /**
   * Event emitted when a query (or all queries) complete
   */
  @Output() query = new EventEmitter<{
    features: Feature[] | Feature[][];
    event: OlMapBrowserPointerEvent;
  }>();

  /**
   * IGO map
   * @internal
   */
  get map(): IgoMap {
    return (this.component.map as any) as IgoMap;
  }

  constructor(
    @Self() private component: MapBrowserComponent,
    private queryService: QueryService
  ) {}

  /**
   * Start listening to click and drag box events
   * @internal
   */
  ngAfterViewInit() {
    this.listenToMapClick();
  }

  /**
   * Stop listening to click and drag box events and cancel ongoind requests
   * @internal
   */
  ngOnDestroy() {
    this.cancelOngoingQueries();
    this.unlistenToMapClick();
  }

  /**
   * On map click, issue queries
   */
  private listenToMapClick() {
    this.mapClickListener = this.map.ol.on(
      'singleclick',
      (event: OlMapBrowserPointerEvent) => this.onMapEvent(event)
    );
  }

  /**
   * Stop listenig for map clicks
   */
  private unlistenToMapClick() {
    this.map.ol.un(this.mapClickListener.type, this.mapClickListener.listener);
    this.mapClickListener = undefined;
  }

  /**
   * Issue queries from a map event and emit events with the results
   * @param event OL map browser pointer event
   */
  private onMapEvent(event: OlMapBrowserPointerEvent) {
    this.cancelOngoingQueries();
    if (!this.queryService.queryEnabled) {
      return;
    }

    const queries$ = [];
    if (this.queryFeatures) {
      queries$.push(this.doQueryFeatures(event));
    }

    const resolution = this.map.ol.getView().getResolution();
    const queryLayers = this.map.layers.filter(layerIsQueryable);
    queries$.push(
      ...this.queryService.query(queryLayers, {
        coordinates: event.coordinate,
        projection: this.map.projection,
        resolution
      })
    );

    if (queries$.length === 0) {
      return;
    }

    if (this.waitForAllQueries) {
      this.queries$$.push(
        zip(...queries$).subscribe((results: Feature[][]) => {
          const features = [].concat(...results);
          this.query.emit({ features, event });
        })
      );
    } else {
      this.queries$$ = queries$.map((query$: Observable<Feature[]>) => {
        return query$.subscribe((features: Feature[]) => {
          this.query.emit({ features, event });
        });
      });
    }
  }

  /**
   * Query features already present on the map
   * @param event OL map browser pointer event
   */
  private doQueryFeatures(
    event: OlMapBrowserPointerEvent
  ): Observable<Feature[]> {
    const clickedFeatures = [];

    this.map.ol.forEachFeatureAtPixel(
      event.pixel,
      (featureOL: OlFeature, layerOL: OlLayer) => {
        if (featureOL) {
          if (featureOL.get('features')) {
            featureOL = featureOL.get('features')[0];
          }
          const feature = featureFromOl(
            featureOL,
            this.map.projection,
            layerOL
          );
          clickedFeatures.push(feature);
        } else {
          const feature = featureFromOl(
            featureOL,
            this.map.projection,
            layerOL
          );
          clickedFeatures.push(feature);
        }
      },
      {
        hitTolerance: this.queryFeaturesHitTolerance || 0,
        layerFilter: this.queryFeaturesCondition
          ? this.queryFeaturesCondition
          : olLayerIsQueryable
      }
    );

    const queryableLayers = this.map.layers.filter(layerIsQueryable);
    clickedFeatures.forEach((feature: Feature) => {
      queryableLayers.forEach((layer: AnyLayer) => {
        if (typeof layer.ol.getSource().hasFeature !== 'undefined') {
          if (layer.ol.getSource().hasFeature(feature.ol)) {
            feature.meta.alias = this.queryService.getAllowedFieldsAndAlias(
              layer
            );
            feature.meta.title = this.queryService.getQueryTitle(
              feature,
              layer
            );
          }
        }
      });
    });

    return of(clickedFeatures);
  }

  /**
   * Cancel ongoing requests, if any
   */
  private cancelOngoingQueries() {
    this.queries$$.forEach((sub: Subscription) => sub.unsubscribe());
    this.queries$$ = [];
  }
}

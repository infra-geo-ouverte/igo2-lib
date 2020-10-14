
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
import { unByKey } from 'ol/Observable';

import OlFeature from 'ol/Feature';
import OlRenderFeature from 'ol/render/Feature';
import OlLayer from 'ol/layer/Layer';

import { MapBrowserPointerEvent as OlMapBrowserPointerEvent } from 'ol/MapBrowserEvent';
import { ListenerFunction } from 'ol/events';

import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { Feature } from '../../feature/shared/feature.interfaces';
import { renderFeatureFromOl } from '../../feature/shared/feature.utils';
import { featureFromOl } from '../../feature/shared/feature.utils';
import { QueryService } from './query.service';
import { layerIsQueryable, olLayerIsQueryable } from './query.utils';
import { ctrlKeyDown } from '../../map/shared/map.utils';
import { OlDragSelectInteraction } from '../../feature/shared/strategies/selection';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';

/**
 * This directive makes a map queryable with a click of with a drag box.
 * By default, all layers are queryable but this can ben controlled at
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
  private olDragSelectInteraction: OlDragSelectInteraction;

  /**
   * Ol drag box "end" event key
   */
  private olDragSelectInteractionEndKey: string;

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
    this.addDragBoxInteraction();
  }

  /**
   * Stop listening to click and drag box events and cancel ongoind requests
   * @internal
   */
  ngOnDestroy() {
    this.cancelOngoingQueries();
    this.unlistenToMapClick();
    this.removeDragBoxInteraction();
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
   * Stop listening for map clicks
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

    if (event.type === 'singleclick') {
      this.map.ol.forEachFeatureAtPixel(
        event.pixel,
        (featureOL: OlFeature, layerOL: OlLayer) => {
          const layer = this.map.getLayerById(layerOL.values_._layer.id);
          if (featureOL) {
            if (featureOL.get('features')) {
              for (const feature of featureOL.get('features')) {
                const newFeature = featureFromOl(feature, this.map.projection);
                newFeature.meta = {
                  title: feature.values_.nom,
                  id: layerOL.values_._layer.id + '.' + feature.id_,
                  icon: feature.values_._icon,
                  sourceTitle: layerOL.values_.title,
                  alias: this.queryService.getAllowedFieldsAndAlias(layer),
                  // title: this.queryService.getQueryTitle(newFeature, layer) || newFeature.meta.title
                };
                clickedFeatures.push(newFeature);
              }
            } else if (featureOL instanceof OlRenderFeature) {
              const newFeature = renderFeatureFromOl(
                featureOL,
                this.map.projection,
                layerOL
              );
              newFeature.meta = {
                id: layerOL.values_._layer.id + '.' + newFeature.meta.id,
                sourceTitle: layerOL.values_.title,
                alias: this.queryService.getAllowedFieldsAndAlias(layer),
                title: this.queryService.getQueryTitle(newFeature, layer) || newFeature.meta.title
              };
              clickedFeatures.push(newFeature);
            } else {
              const newFeature = featureFromOl(
                featureOL,
                this.map.projection,
                layerOL
              );
              newFeature.meta = {
                id: layerOL.values_._layer.id + '.' + newFeature.meta.id,
                sourceTitle: layerOL.values_.title,
                alias: this.queryService.getAllowedFieldsAndAlias(layer),
                title: this.queryService.getQueryTitle(newFeature, layer) || newFeature.meta.title
              };
              clickedFeatures.push(newFeature);
            }
          }
        },
        {
          hitTolerance: this.queryFeaturesHitTolerance || 0,
          layerFilter: this.queryFeaturesCondition
            ? this.queryFeaturesCondition
            : olLayerIsQueryable
        }
      );
    } else if (event.type === 'boxend') {
      const dragExtent = event.target.getGeometry().getExtent();
      this.map.layers
        .filter(layerIsQueryable)
        .filter(layer => layer instanceof VectorLayer && layer.visible)
        .map(layer => {
          const featuresOL = layer.dataSource.ol;
          featuresOL.forEachFeatureIntersectingExtent(dragExtent, (olFeature: OlFeature) => {
            const newFeature: Feature = featureFromOl(olFeature, this.map.projection, layer.ol);
            newFeature.meta = {
              id: layer.id + '.' + olFeature.id_,
              icon: olFeature.values_._icon,
              sourceTitle: layer.title,
              alias: this.queryService.getAllowedFieldsAndAlias(layer),
              title: this.queryService.getQueryTitle(newFeature, layer) || newFeature.meta.title
            };
            clickedFeatures.push(newFeature);
          });
        });
    }


    return of(clickedFeatures);
  }

  /**
   * Cancel ongoing requests, if any
   */
  private cancelOngoingQueries() {
    this.queries$$.forEach((sub: Subscription) => sub.unsubscribe());
    this.queries$$ = [];
  }

  /**
   * Add a drag box interaction and, on drag box end, select features
   */
  private addDragBoxInteraction() {
    let olDragSelectInteractionOnQuery;
    const olInteractions = this.map.ol.getInteractions().getArray();

    // There can only be one dragbox interaction, so find the current one, if any
    // Don't keep a reference to the current dragbox because we don't want
    // to remove it when this startegy is deactivated
    for (const olInteraction of olInteractions) {
      if (olInteraction instanceof OlDragSelectInteraction) {
        olDragSelectInteractionOnQuery = olInteraction;
        break;
      }
    }
    // If no drag box interaction is found, create a new one and add it to the map
    if (olDragSelectInteractionOnQuery === undefined) {
      olDragSelectInteractionOnQuery = new OlDragSelectInteraction({
        condition: ctrlKeyDown
      });
      this.map.ol.addInteraction(olDragSelectInteractionOnQuery);
      this.olDragSelectInteraction = olDragSelectInteractionOnQuery;
    }

    this.olDragSelectInteractionEndKey = olDragSelectInteractionOnQuery.on(
      'boxend',
      (event: OlMapBrowserPointerEvent) => this.onMapEvent(event)
    );
  }

  /**
   * Remove drag box interaction
   */
  private removeDragBoxInteraction() {
    if (this.olDragSelectInteractionEndKey !== undefined) {
      unByKey(this.olDragSelectInteractionEndKey);
    }
    if (this.olDragSelectInteraction !== undefined) {
      this.map.ol.removeInteraction(this.olDragSelectInteraction);
    }
    this.olDragSelectInteraction = undefined;
  }
}

import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  inject
} from '@angular/core';

import OlFeature from 'ol/Feature';
import MapBrowserPointerEvent from 'ol/MapBrowserEvent';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import OlLayer from 'ol/layer/Layer';
import OlRenderFeature from 'ol/render/Feature';
import OlSource from 'ol/source/Source';
import olVectorSource from 'ol/source/Vector';

import { Observable, Subscription, of, zip } from 'rxjs';

import { Feature } from '../../feature/shared/feature.interfaces';
import { renderFeatureFromOl } from '../../feature/shared/feature.utils';
import { featureFromOl } from '../../feature/shared/feature.utils';
import { OlDragSelectInteraction } from '../../feature/shared/strategies/selection';
import { Layer, isLayerGroup, isLayerItem } from '../../layer';
import { VectorLayer } from '../../layer/shared/layers/vector-layer';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { IgoMap } from '../../map/shared/map';
import { ctrlKeyDown } from '../../map/shared/map.utils';
import { QueryableDataSourceOptions } from './query.interfaces';
import { QueryService } from './query.service';
import { layerIsQueryable, olLayerFeatureIsQueryable } from './query.utils';

/**
 * This directive makes a map queryable with a click of with a drag box.
 * By default, all layers are queryable but this can ben controlled at
 * the layer level.
 */
@Directive({
  selector: '[igoQuery]',
  standalone: true
})
export class QueryDirective implements AfterViewInit, OnDestroy {
  private component = inject(MapBrowserComponent, { self: true });
  private queryService = inject(QueryService);

  /**
   * Subscriptions to ongoing queries
   */
  private queries$$: Subscription[] = [];

  /**
   * Listener to the map click event
   */
  private mapClickListener;

  /**
   * OL drag box interaction
   */
  private olDragSelectInteraction: OlDragSelectInteraction;

  /**
   * Ol drag box "end" event key
   */
  private olDragSelectInteractionEndKey: EventsKey | EventsKey[];

  /**
   * Whter to query features or not
   */
  @Input() queryFeatures = false;

  /**
   * Feature query hit tolerance
   */
  @Input() queryFeaturesHitTolerance = 0;

  /**
   * Feature query hit tolerance
   */
  @Input() queryFeaturesCondition: (olLayer: OlLayer<OlSource>) => boolean;

  /**
   * Whether all query should complete before emitting an event
   */
  @Input() waitForAllQueries = true;

  /**
   * Event emitted when a query (or all queries) complete
   */
  @Output() query = new EventEmitter<{
    features: Feature[] | Feature[][];
    event: MapBrowserPointerEvent<any>;
  }>();

  /**
   * IGO map
   * @internal
   */
  get map(): IgoMap {
    return this.component.map as any as IgoMap;
  }

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
      (event: MapBrowserPointerEvent<any>) => this.onMapEvent(event)
    );
  }

  /**
   * Stop listening for map clicks
   */
  private unlistenToMapClick() {
    unByKey(this.mapClickListener);
    this.mapClickListener = undefined;
  }

  /**
   * Issue queries from a map event and emit events with the results
   * @param event OL map browser pointer event
   */
  private onMapEvent(event: MapBrowserPointerEvent<any>) {
    this.cancelOngoingQueries();
    if (!this.queryService.queryEnabled) {
      return;
    }

    const queries$ = [];
    if (this.queryFeatures) {
      queries$.push(this.doQueryFeatures(event));
    }

    const resolution = this.map.ol.getView().getResolution();
    const queryLayers = this.map.layerController.all.filter(
      layerIsQueryable
    ) as Layer[];
    queries$.push(
      ...this.queryService.query(queryLayers, {
        coordinates: event.coordinate as [number, number],
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
    event: MapBrowserPointerEvent<any>
  ): Observable<Feature[]> {
    const clickedFeatures = [];

    if (event.type === 'singleclick') {
      this.map.ol.forEachFeatureAtPixel(
        event.pixel,
        (featureOL: OlFeature, layerOL: any) => {
          const layer = this.map.layerController.getById(
            layerOL.values_._layer.id
          );
          if (isLayerGroup(layer) || !layer.displayed) {
            return;
          }
          if (
            (layer.dataSource.options as QueryableDataSourceOptions)
              .queryFormatAsWms
          ) {
            return;
          }
          if (featureOL) {
            if (featureOL.get('features')) {
              for (const feature of featureOL.get('features')) {
                const newFeature = featureFromOl(feature, this.map.projection);
                newFeature.meta = {
                  title: feature.values_.nom,
                  id: layerOL.values_._layer.id + '.' + feature.id_,
                  icon: feature.values_._icon,
                  sourceTitle: layerOL.values_.title,
                  alias: this.queryService.getAllowedFieldsAndAlias(layer)
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
                title:
                  this.queryService.getQueryTitle(newFeature, layer) ||
                  newFeature.meta.title
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
                title:
                  this.queryService.getQueryTitle(newFeature, layer) ||
                  newFeature.meta.title
              };
              clickedFeatures.push(newFeature);
            }
          }
        },
        {
          hitTolerance: this.queryFeaturesHitTolerance || 0,
          layerFilter: this.queryFeaturesCondition
            ? this.queryFeaturesCondition
            : olLayerFeatureIsQueryable
        }
      );
    } else if (event.type === 'boxend') {
      const target = event.target as any;
      const dragExtent = target.getGeometry().getExtent();
      this.map.layerController.all
        .filter(layerIsQueryable)
        .filter(
          (layer) =>
            isLayerItem(layer) && layer instanceof VectorLayer && layer.visible
        )
        .map((layer: Layer) => {
          const featuresOL = layer.dataSource.ol as olVectorSource;
          featuresOL.forEachFeatureIntersectingExtent(
            dragExtent,
            (olFeature: any) => {
              const newFeature: Feature = featureFromOl(
                olFeature,
                this.map.projection,
                layer.ol
              );
              newFeature.meta = {
                id: layer.id + '.' + olFeature.getId(),
                icon: olFeature.values_._icon,
                sourceTitle: layer.title,
                alias: this.queryService.getAllowedFieldsAndAlias(layer),
                title:
                  this.queryService.getQueryTitle(newFeature, layer) ||
                  newFeature.meta.title
              };
              clickedFeatures.push(newFeature);
            }
          );
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
      (event: MapBrowserPointerEvent<any>) => this.onMapEvent(event)
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

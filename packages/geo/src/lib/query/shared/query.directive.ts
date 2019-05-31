import {
  Directive,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  Self
} from '@angular/core';

import { Subscription, Observable, zip } from 'rxjs';

import OlDragBoxInteraction from 'ol/interaction/DragBox';
import { MapBrowserPointerEvent as OlMapBrowserPointerEvent } from 'ol/MapBrowserEvent';
import { ListenerFunction } from 'ol/events';

import { AnyLayer } from '../../layer/shared/layers/any-layer';
import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { Feature } from '../../feature/shared/feature.interfaces';
import { QueryableDataSource } from './query.interfaces';
import { QueryService } from './query.service';

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

    const resolution = this.map.ol.getView().getResolution();
    const queryLayers = this.map.layers.filter((layer: AnyLayer) =>
      this.layerIsQueryable(layer)
    );
    const queries$ = this.queryService.query(queryLayers, {
      coordinates: event.coordinate,
      projection: this.map.projection,
      resolution
    });

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
   * Cancel ongoing requests, if any
   */
  private cancelOngoingQueries() {
    this.queries$$.forEach((sub: Subscription) => sub.unsubscribe());
    this.queries$$ = [];
  }

  /**
   * Whether a layer is queryable
   * @param layer Layer
   * @returns True if the layer si queryable
   */
  private layerIsQueryable(layer: AnyLayer): boolean {
    const dataSource = layer.dataSource as QueryableDataSource;
    return dataSource.options.queryable !== undefined
      ? dataSource.options.queryable
      : true;
  }
}

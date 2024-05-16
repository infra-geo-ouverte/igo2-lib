import {
  EntityKey,
  EntityRecord,
  EntityStoreStrategy
} from '@igo2/common/entity';

import OlFeature from 'ol/Feature';
import MapBrowserPointerEvent from 'ol/MapBrowserEvent';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import type { default as OlGeometry } from 'ol/geom/Geometry';
import OlDragBoxInteraction, { DragBoxEvent } from 'ol/interaction/DragBox';
import { DragBoxEvent as OlDragBoxEvent } from 'ol/interaction/DragBox';

import { Subscription, combineLatest } from 'rxjs';
import { debounceTime, map, skip } from 'rxjs/operators';

import { FeatureDataSource } from '../../../datasource/shared/datasources';
import { VectorLayer } from '../../../layer/shared/layers/vector-layer';
import { IgoMap } from '../../../map/shared/map';
import { ctrlKeyDown } from '../../../map/shared/map.utils';
import { FeatureMotion } from '../feature.enums';
import {
  Feature,
  FeatureStoreSelectionStrategyOptions
} from '../feature.interfaces';
import { FeatureStore } from '../store';

export class OlDragSelectInteraction extends OlDragBoxInteraction {
  constructor(options) {
    super(options);
  }
}

/**
 * This strategy synchronizes a store and a layer selected entities.
 * The store <-> layer binding is a two-way binding.
 *
 * In many cases, a single strategy bound to multiple stores
 * will yield better results that multiple strategies with each their
 * own store. In the latter scenario, a click on overlapping features
 * would trigger the strategy of each layer and they would cancel
 * each other as well as move the map view around needlessly.
 */
export class FeatureStoreSelectionStrategy extends EntityStoreStrategy {
  /**
   * Listener to the map click event that allows selecting a feature
   * by clicking on the map
   */
  private mapClickListener;

  private olDragSelectInteraction: OlDragSelectInteraction;

  private olDragSelectInteractionEndKey: EventsKey | EventsKey[];

  /**
   * Subscription to all stores selected entities
   */
  private stores$$: Subscription;

  private motion: FeatureMotion;

  /**
   * The map the layers belong to
   */
  get map(): IgoMap {
    return this.options.map;
  }

  /**
   * A feature store that'll contain the selected features. It has it's own
   * layer, shared by all the stores this staretgy is bound to.
   */
  get overlayStore(): FeatureStore {
    return this._overlayStore;
  }
  private _overlayStore: FeatureStore;

  constructor(protected options: FeatureStoreSelectionStrategyOptions) {
    super(options);
    this.setMotion(options.motion);
    this._overlayStore = this.createOverlayStore();
  }

  /**
   * Bind this strategy to a store and force this strategy's
   * reactivation to properly setup watchers.
   * @param store Feature store
   */
  bindStore(store: FeatureStore) {
    super.bindStore(store);
    if (this.active === true) {
      // Force reactivation
      this.activate();
    }
  }

  /**
   * Unbind this strategy from a store and force this strategy's
   * reactivation to properly setup watchers.
   * @param store Feature store
   */
  unbindStore(store: FeatureStore) {
    super.unbindStore(store);
    if (this.active === true) {
      // Force reactivation
      this.activate();
    }
  }

  /**
   * Define the motion to apply on select
   * @param motion Feature motion
   */
  setMotion(motion: FeatureMotion) {
    this.motion = motion;
  }

  /**
   * Unselect all entities, from all stores
   */
  unselectAll() {
    this.stores.forEach((store: FeatureStore) => {
      store.state.updateAll({ selected: false });
    });
  }

  /**
   * Clear the overlay
   */
  clear() {
    this.overlayStore.source.ol.clear();
    this.overlayStore.clear();
  }

  /**
   * Deactivate the selection without removing the selection
   * overlay.
   */
  deactivateSelection() {
    this.unlistenToMapClick();
    this.removeDragBoxInteraction();
    this.unwatchAll();
  }

  /**
   * Add the overlay layer, setup the map click lsitener and
   * start watching for stores selection
   * @internal
   */
  protected doActivate() {
    this.addOverlayLayer();
    this.listenToMapClick();
    if (this.options.dragBox === true) {
      this.addDragBoxInteraction();
    }
    this.watchAll();
  }

  /**
   * Remove the overlay layer, remove the map click lsitener and
   * stop watching for stores selection
   * @internal
   */
  protected doDeactivate() {
    this.deactivateSelection();
    this.removeOverlayLayer();
  }

  /**
   * Create a single observable of all the stores. With a single observable,
   * features can be added all at once to the overlay layer and a single
   * motion can be performed. Multiple observable would have
   * a cancelling effect on each other.
   */
  private watchAll() {
    this.unwatchAll();

    const stores$ = this.stores.map((store: FeatureStore) => {
      return store.stateView
        .manyBy$((record: EntityRecord<Feature>) => {
          return record.state.selected === true;
        })
        .pipe(
          map((records: EntityRecord<Feature>[]) =>
            records.map((record) => record.entity)
          )
        );
    });
    this.stores$$ = combineLatest(stores$)
      .pipe(
        debounceTime(5),
        skip(1), // Skip intial selection
        map((features: Array<Feature[]>) =>
          features.reduce((a, b) => a.concat(b))
        )
      )
      .subscribe((features: Feature[]) => this.onSelectFromStore(features));
  }

  /**
   * Stop watching for selection in all stores.
   */
  private unwatchAll() {
    if (this.stores$$ !== undefined) {
      this.stores$$.unsubscribe();
    }
  }

  /**
   * Add a 'singleclick' listener to the map that'll allow selecting
   * features by clicking on the map. The selection will be performed
   * only on the layers bound to this strategy.
   */
  private listenToMapClick() {
    this.mapClickListener = this.map.ol.on(
      'singleclick',
      (event: MapBrowserPointerEvent<any>) => {
        this.onMapClick(event);
      }
    );
  }

  /**
   * Remove the map click listener
   */
  private unlistenToMapClick() {
    unByKey(this.mapClickListener);
  }

  /**
   * On map click, select feature at pixel
   * @param event OL MapBrowserPointerEvent
   */
  private onMapClick(event: MapBrowserPointerEvent<any>) {
    const exclusive = !ctrlKeyDown(event);
    const reverse = !exclusive;
    const olFeatures = event.map.getFeaturesAtPixel(event.pixel, {
      hitTolerance: this.options.hitTolerance || 0,
      layerFilter: (olLayer) => {
        const storeOlLayer = this.stores.find((store: FeatureStore) => {
          return store.layer?.ol === olLayer;
        });
        return storeOlLayer !== undefined;
      }
    }) as OlFeature<OlGeometry>[];
    this.onSelectFromMap(olFeatures, exclusive, reverse);
  }

  /**
   * Add a drag box interaction and, on drag box end, select features
   */
  private addDragBoxInteraction() {
    let olDragSelectInteraction;
    const olInteractions = this.map.ol.getInteractions().getArray();

    // There can only be one dragbox interaction, so find the current one, if any
    // Don't keep a reference to the current dragbox because we don't want
    // to remove it when this startegy is deactivated
    for (const olInteraction of olInteractions) {
      if (olInteraction instanceof OlDragSelectInteraction) {
        olDragSelectInteraction = olInteraction;
        break;
      }
    }
    // If no drag box interaction is found, create a new one and add it to the map
    if (olDragSelectInteraction === undefined) {
      olDragSelectInteraction = new OlDragSelectInteraction({
        condition: ctrlKeyDown
      });
      this.map.ol.addInteraction(olDragSelectInteraction);
      this.olDragSelectInteraction = olDragSelectInteraction;
    }

    this.olDragSelectInteractionEndKey = olDragSelectInteraction.on(
      'boxend',
      (event: DragBoxEvent) => this.onDragBoxEnd(event)
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

  /**
   * On dragbox end, select features in drag box
   * @param event OL MapBrowserPointerEvent
   */
  private onDragBoxEnd(event: OlDragBoxEvent) {
    const exclusive = !ctrlKeyDown(event.mapBrowserEvent);
    const target = event.target as any;
    const extent = target.getGeometry().getExtent();
    const olFeatures = this.stores.reduce(
      (acc: OlFeature<OlGeometry>[], store: FeatureStore) => {
        const olSource = store.layer.ol.getSource();
        acc.push(...olSource.getFeaturesInExtent(extent));
        return acc;
      },
      []
    );
    this.onSelectFromMap(olFeatures, exclusive, false);
  }

  /**
   * When features are selected from the store, add
   * them to this startegy's overlay layer (select on map)
   * @param features Store features
   */
  private onSelectFromStore(features: Feature[]) {
    const motion = this.motion;
    const olOverlayFeatures = this.overlayStore.layer.ol
      .getSource()
      .getFeatures();
    const overlayFeaturesKeys = olOverlayFeatures.map(
      (olFeature: OlFeature<OlGeometry>) => olFeature.getId()
    );
    const featuresKeys = features.map(this.overlayStore.getKey);

    let doMotion;
    if (features.length === 0) {
      doMotion = false;
    } else {
      doMotion =
        overlayFeaturesKeys.length !== featuresKeys.length ||
        !overlayFeaturesKeys.every(
          (key: EntityKey) => featuresKeys.indexOf(key) >= 0
        );
    }

    this.overlayStore.setLayerFeatures(
      features,
      doMotion ? motion : FeatureMotion.None,
      this.options.viewScale,
      this.options.areaRatio,
      this.options.getFeatureId
    );
  }

  /**
   * When features are selected from the map, also select them
   * in their store.
   * @param olFeatures OL feature objects
   */
  private onSelectFromMap(
    olFeatures: OlFeature<OlGeometry>[],
    exclusive: boolean,
    reverse: boolean
  ) {
    const groupedFeatures = this.groupFeaturesByStore(olFeatures);

    this.stores.forEach((store: FeatureStore) => {
      const features = groupedFeatures.get(store);
      if (features === undefined && exclusive === true) {
        this.unselectAllFeaturesFromStore(store);
      } else if (features === undefined && exclusive === false) {
        // Do nothing
      } else {
        this.selectFeaturesFromStore(store, features, exclusive, reverse);
      }
    });
  }

  /**
   * Select features in store
   * @param store: Feature store
   * @param features Features
   */
  private selectFeaturesFromStore(
    store: FeatureStore,
    features: Feature[],
    exclusive: boolean,
    reverse: boolean
  ) {
    if (reverse === true) {
      store.state.reverseMany(features, ['selected']);
    } else {
      store.state.updateMany(features, { selected: true }, exclusive);
    }
  }

  /**
   * Unselect all features from store
   * @param store: Feature store
   */
  private unselectAllFeaturesFromStore(store: FeatureStore) {
    store.state.updateAll({ selected: false });
  }

  /**
   * This method returns a store -> features mapping from a list
   * of OL selected features. OL features keep a reference to the store
   * they are from.
   * @param olFeatures: OL feature objects
   * @returns Store -> features mapping
   */
  private groupFeaturesByStore(
    olFeatures: OlFeature<OlGeometry>[]
  ): Map<FeatureStore, Feature[]> {
    const groupedFeatures = new Map<FeatureStore, Feature[]>();
    if (olFeatures === null || olFeatures === undefined) {
      return groupedFeatures;
    }

    olFeatures.forEach((olFeature: OlFeature<OlGeometry>) => {
      const store = olFeature.get('_featureStore');
      if (store === undefined) {
        return;
      }

      let features = groupedFeatures.get(store);
      if (features === undefined) {
        features = [];
        groupedFeatures.set(store, features);
      }

      const feature = store.get(olFeature.getId());
      if (feature !== undefined) {
        features.push(feature);
      }
    });

    return groupedFeatures;
  }

  /**
   * Create an overlay store that'll contain the selected features.
   * @returns Overlay store
   */
  private createOverlayStore(): FeatureStore {
    const overlayLayer = this.options.layer
      ? this.options.layer
      : this.createOverlayLayer();
    return new FeatureStore([], { map: this.map }).bindLayer(overlayLayer);
  }

  /**
   * Create an overlay store that'll contain the selected features.
   * @returns Overlay layer
   */
  private createOverlayLayer(): VectorLayer {
    return new VectorLayer({
      zIndex: 300,
      source: new FeatureDataSource(),
      style: undefined,
      showInLayerList: false,
      exportable: false,
      browsable: false
    });
  }

  /**
   * Add the overlay store's layer to the map to display the selected
   * features.
   */
  private addOverlayLayer() {
    if (this.overlayStore.layer.map === undefined) {
      this.map.addLayer(this.overlayStore.layer);
    }
  }

  /**
   * Remove the overlay layer from the map
   */
  private removeOverlayLayer() {
    this.overlayStore.source.ol.clear();
    this.map.removeLayer(this.overlayStore.layer);
  }
}

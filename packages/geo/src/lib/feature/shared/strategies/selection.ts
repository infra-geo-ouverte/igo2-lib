import OlFeature from 'ol/Feature';

import { ListenerFunction } from 'ol/events';

import { Subscription, combineLatest } from 'rxjs';
import { map, debounceTime, skip } from 'rxjs/operators';

import { EntityKey, EntityRecord } from '@igo2/common';

import { FeatureDataSource } from '../../../datasource';
import { VectorLayer } from '../../../layer';
import { IgoMap } from '../../../map';

import { Feature, FeatureStoreSelectionStrategyOptions } from '../feature.interfaces';
import { FeatureStore } from '../store';
import { FeatureStoreStrategy } from './strategy';
import { FeatureMotion } from '../feature.enums';

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
export class FeatureStoreSelectionStrategy extends FeatureStoreStrategy {

  /**
   * Listener to the map click event that allows selecting a feature
   * by clicking on the map
   */
  private mapClickListener: ListenerFunction;

  /**
   * A feature store that'll contain the selected features. It has it's own
   * layer, shared by all the stores this staretgy is bound to.
   */
  private overlayStore: FeatureStore;

  /**
   * Subscription to all stores selected entities
   */
  private stores$$: Subscription;

  /**
   * The map the layers belong to
   */
  get map(): IgoMap { return this.options.map; }

  constructor(protected options: FeatureStoreSelectionStrategyOptions) {
    super(options);
    this.overlayStore = this.createOverlayStore();
  }

  /**
   * Bind this strategy to a store and force this strategy's
   * reactivation to properly setup watchers.
   * @param store Feature store
   */
  bindStore(store: FeatureStore) {
    super.bindStore(store);
    if (this.isActive() === true) {
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
    if (this.isActive() === true) {
      // Force reactivation
      this.activate();
    }
  }

  /**
   * Unselect all entities, from all stores
   */
  unselectAll() {
    this.stores.forEach((store: FeatureStore) => {
      store.state.updateAll({selected: false});
    });
  }

  /**
   * Add the overlay layer, setup the map click lsitener and
   * start watching for stores selection
   * @internal
   */
  protected doActivate() {
    this.addOverlayLayer();
    this.listenToMapClick();
    this.watchAll();
  }

  /**
   * Remove the overlay layer, remove the map click lsitener and
   * stop watching for stores selection
   * @internal
   */
  protected doDeactivate() {
    this.unlistenToMapClick();
    this.unwatchAll();
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
      return store.stateView.manyBy$((record: EntityRecord<Feature>) => {
        return record.state.selected === true;
      }).pipe(
        map((records: EntityRecord<Feature>[]) => records.map(record => record.entity))
      );
    });
    this.stores$$ = combineLatest(...stores$)
      .pipe(
        debounceTime(50),
        skip(1), // Skip intial selection
        map((features: Array<Feature[]>) => features.reduce((a, b) => a.concat(b)))
      ).subscribe((features: Feature[]) => this.onSelectFromStore(features));
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
    this.mapClickListener = this.map.ol.on('singleclick', (event) => {
      const olFeatures = event.map.getFeaturesAtPixel(event.pixel, {
        hitTolerance: this.options.hitTolerance || 0,
        layerFilter: (olLayer) => {
          const storeOlLayer = this.stores.find((store: FeatureStore) => {
            return store.layer.ol === olLayer;
          });
          return storeOlLayer !== undefined;
        }
      });
      this.onSelectFromMap(olFeatures);
    });
  }

  /**
   * Remove the map click listener
   */
  private unlistenToMapClick() {
    if (this.mapClickListener !== undefined) {
      this.map.ol.un(
        this.mapClickListener.type,
        this.mapClickListener.listener
      );
    }
  }

  /**
   * When features are selected from the store, add
   * them to this startegy's overlay layer (select on map)
   * @param features Store features
   */
  private onSelectFromStore(features: Feature[]) {
    const motion = this.options ? this.options.motion : undefined;
    const olOverlayFeatures = this.overlayStore.layer.ol.getSource().getFeatures();
    const overlayFeaturesKeys = olOverlayFeatures.map((olFeature: OlFeature) => olFeature.getId());
    const featuresKeys = features.map(this.overlayStore.getKey);
    const doMotion = overlayFeaturesKeys.length !== featuresKeys.length ||
      !overlayFeaturesKeys.every((key: EntityKey) => featuresKeys.indexOf(key) >= 0);

    this.overlayStore.setLayerFeatures(
      features,
      doMotion ? motion : FeatureMotion.None,
      this.options.getFeatureId
    );
  }

  /**
   * When features are selected from the map, also select them
   * in their store.
   * @param olFeatures OL feature objects
   */
  private onSelectFromMap(olFeatures?: OlFeature[]) {
    const groupedFeatures = this.groupFeaturesByStore(olFeatures);

    this.stores.forEach((store: FeatureStore) => {
      const features = groupedFeatures.get(store);
      if (features === undefined) {
        this.unselectAllFeaturesFromStore(store);
      } else {
        this.selectFeaturesFromStore(store, features);
      }
    });
  }

  /**
   * Select features in store
   * @param store: Feature store
   * @param features Features
   */
  private selectFeaturesFromStore(store: FeatureStore, features: Feature[]) {
    const many = this.options ? this.options.many : false;
    store.state.updateMany(features, {selected: true}, !many);
  }

  /**
   * Unselect all features from store
   * @param store: Feature store
   */
  private unselectAllFeaturesFromStore(store: FeatureStore) {
    store.state.updateAll({selected: false});
  }

  /**
   * This method returns a store -> features mapping from a list
   * of OL selected features. OL features keep a reference to the store
   * they are from.
   * @param olFeatures: OL feature objects
   * @returns Store -> features mapping
   */
  private groupFeaturesByStore(olFeatures: OlFeature[]): Map<FeatureStore, Feature[]> {
    const groupedFeatures = new Map<FeatureStore, Feature[]>();
    if (olFeatures === null || olFeatures === undefined) {
      return groupedFeatures;
    }

    olFeatures.forEach((olFeature: OlFeature) => {
      const store = olFeature.get('_featureStore');
      if (store === undefined) { return; }

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
  private createOverlayStore() {
    const overlayLayer = new VectorLayer({
      zIndex: 200,
      source: new FeatureDataSource(),
      style: this.options ? this.options.style : undefined,
      showInLayerList: false
    });

    return new FeatureStore([], {map: this.map}).bindLayer(overlayLayer);
  }

  /**
   * Add the overlay store's layer to the map to display the selected
   * features.
   */
  private addOverlayLayer() {
    this.map.ol.addLayer(this.overlayStore.layer.ol);
  }

  /**
   * Remove the overlay layer from the map
   */
  private removeOverlayLayer() {
    this.overlayStore.source.ol.clear();
    this.map.ol.removeLayer(this.overlayStore.layer.ol);
  }
}

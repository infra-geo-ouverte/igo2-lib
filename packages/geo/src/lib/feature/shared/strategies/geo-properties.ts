import { EntityStoreStrategy } from '@igo2/common';
import { CapabilitiesService } from '../../../datasource/shared/capabilities.service';
import { FeatureStore } from '../store';
import { FeatureStorePropertyTypeStrategyOptions } from '../feature.interfaces';
import { Subscription } from 'rxjs';
import { PropertyTypeDetectorService } from '../../../utils/propertyTypeDetector/propertyTypeDetector.service';
import { ObjectUtils } from '@igo2/utils';
import { generateIdFromSourceOptions } from '../../../utils/id-generator';
import { IgoMap } from '../../../map/shared/map';

/**
 * This strategy maintain the store features updated to detect geoproperties
 * (wms/arcgis... layer and url).
 * The features's state inside the map are tagged haveGeoServiceProperties = true;
 */
export class GeoPropertiesStrategy extends EntityStoreStrategy {

  /**
   * Subscription to the store's OL source changes
   */
  private stores$$ = new Map<FeatureStore, string>();
  private states$$: Subscription[] = [];
  private empty$$: Subscription;

  /**
   * The map the layer is bound to
   */
  private readonly map: IgoMap;

  constructor(
    protected options: FeatureStorePropertyTypeStrategyOptions,
    private propertyTypeDetectorService: PropertyTypeDetectorService,
    private capabilitiesService: CapabilitiesService) {
    super(options);
    this.map = options.map;
  }

  /**
   * Bind this strategy to a store and start watching for Ol source changes
   * @param store Feature store
   */
  bindStore(store: FeatureStore) {
    super.bindStore(store);
    if (this.active === true) {
      this.watchStore(store);
    }
  }

  /**
   * Unbind this strategy from a store and stop watching for Ol source changes
   * @param store Feature store
   */
  unbindStore(store: FeatureStore) {
    super.unbindStore(store);
    if (this.active === true) {
      this.unwatchStore(store);
    }
  }

  /**
   * Start watching all stores already bound to that strategy at once.
   * @internal
   */
  protected doActivate() {
    this.stores.forEach((store: FeatureStore) => this.watchStore(store));
  }

  /**
   * Stop watching all stores bound to that strategy
   * @internal
   */
  protected doDeactivate() {
    this.unwatchAll();
  }

  /**
   * Watch for a store's  OL source changes
   * @param store Feature store
   */
  private watchStore(store: FeatureStore) {
    if (this.stores$$.has(store)) {
      return;
    }

    this.updateEntitiesPropertiesState(store);
    this.states$$.push(store.entities$.subscribe((entities) => {
      this.updateEntitiesPropertiesState(store);
    }));
  }

  private updateEntitiesPropertiesState(store: FeatureStore) {
    store.entities$.value.map(e => {
      let isGeoService = false;
      let entity;
      // TODO NOTE Ensure to handle queryStore and FeatureStore(vector workspace)
      if ((e as any).data) {
        entity = (e as any).data;
      } else {
        entity = e;
      }
      for (const key of Object.keys(entity.properties)) {
        const value = entity.properties[key];
        isGeoService = this.propertyTypeDetectorService.isGeoService(value);
        if (isGeoService) {
          const geoService = this.propertyTypeDetectorService.getGeoService(value);
          let layerName = entity.properties[geoService.columnForLayerName];
            let appliedLayerName = layerName;
            let arcgisLayerName = undefined;

            if (['arcgisrest', 'imagearcgisrest', 'tilearcgisrest'].includes(geoService.type)) {
              arcgisLayerName = layerName;
              appliedLayerName = undefined;
            }

            const so = ObjectUtils.removeUndefined({
              sourceOptions: {
                type: geoService.type || 'wms',
                url: value,
                optionsFromCapabilities: true,
                optionsFromApi: true,
                params: {
                  LAYERS: appliedLayerName,
                  LAYER: arcgisLayerName
                }
              }
            });


            const potentialLayerId = generateIdFromSourceOptions(so.sourceOptions);

            const ns = {
              geoService: {
                added: this.map.layers.find(l => l.id === potentialLayerId) !== undefined,
                haveGeoServiceProperties: true,
                type: geoService.type,
                url: value,
                layerName: appliedLayerName || arcgisLayerName
              }
            };

            store.state.update(e, ns, true);
          break;
      }}


      });
  }

  /**
   * Stop watching for a store's OL source changes
   * @param store Feature store
   */
  private unwatchStore(store: FeatureStore) {
    const key = this.stores$$.get(store);
    if (key !== undefined) {
      this.stores$$.delete(store);
    }
  }

  /**
   * Stop watching for OL source changes in all stores.
   */
  private unwatchAll() {
    this.stores$$.clear();
    this.states$$.map(state => state.unsubscribe());
    if (this.empty$$) { this.empty$$.unsubscribe(); }
  }
}

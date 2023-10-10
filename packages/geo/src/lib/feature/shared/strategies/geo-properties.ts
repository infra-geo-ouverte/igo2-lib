import { EntityStoreStrategy } from '@igo2/common';
import { CapabilitiesService } from '../../../datasource/shared/capabilities.service';
import { FeatureStore } from '../store';
import {
  Feature,
  FeatureStorePropertyTypeStrategyOptions
} from '../feature.interfaces';
import { Subscription, debounceTime, pairwise } from 'rxjs';
import { PropertyTypeDetectorService } from '../../../utils/propertyTypeDetector/propertyTypeDetector.service';
import { ObjectUtils } from '@igo2/utils';
import { generateIdFromSourceOptions } from '../../../utils/id-generator';
import { IgoMap } from '../../../map/shared/map';
import { Layer } from '../../../layer/shared/layers/layer';
import { GeoServiceDefinition } from '../../../utils';

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
    private capabilitiesService: CapabilitiesService
  ) {
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
    this.states$$.push(
      this.map.layers$
        .pipe(debounceTime(250), pairwise())
        .subscribe(([prevLayers, currentLayers]) => {
          let prevLayersId;
          if (prevLayers) {
            prevLayersId = prevLayers.map((l) => l.id);
          }
          const layers = currentLayers.filter(
            (l) => !prevLayersId.includes(l.id)
          );
          this.updateEntitiesPropertiesState(store, layers);
        })
    );
    this.states$$.push(
      store.entities$.pipe(debounceTime(250)).subscribe((a) => {
        this.updateEntitiesPropertiesState(store);
      })
    );
  }

  private updateEntitiesPropertiesState(store: FeatureStore, layers?: Layer[]) {
    const layersId = this.map.layers.map((l) => l.id);
    let entities: Feature[] = [];
    if (layers) {
      entities = store.entities$.value;
    } else {
      const allSV = store.stateView.all();
      entities = allSV.length
        ? store.stateView
            .all()
            .filter((s) => !s.state.geoService)
            .map((e) => e.entity)
        : store.entities$.value;
    }
    const sampling = entities.length >= 250 ? 250 : entities.length;
    const firstN = entities.slice(0, sampling);
    let allKeys = [];
    firstN.map((e) => {
      allKeys = allKeys.concat(Object.keys(e.properties || {}));
    });
    allKeys = [...new Set(allKeys)];
    const distinctValues = {};
    allKeys.map((k) => {
      distinctValues[k] = [
        ...new Set(entities.map((item) => item.properties[k]))
      ];
    });
    const containGeoServices = {};
    Object.entries(distinctValues).forEach((entry: [string, []]) => {
      const [key, values] = entry;
      const valuedAreGeoservices = values.filter((value) =>
        this.propertyTypeDetectorService.isGeoService(value)
      );
      if (valuedAreGeoservices?.length) {
        containGeoServices[key] = valuedAreGeoservices;
      }
    });
    interface GeoServiceAssociation {
      url: string;
      layerNameProperty: string;
      urlProperty: string;
      geoService: GeoServiceDefinition;
    }
    const geoServiceAssociations: GeoServiceAssociation[] = [];
    Object.entries(containGeoServices).forEach((entry: [string, []]) => {
      const [key, values] = entry;
      values.map((value) => {
        const geoService = this.propertyTypeDetectorService.getGeoService(
          value,
          allKeys
        );
        if (geoService) {
          const propertiesForLayerName = allKeys.filter((p) =>
            geoService.propertiesForLayerName.includes(p)
          );
          // providing the the first matching regex;
          const propertyForLayerName = propertiesForLayerName.length
            ? propertiesForLayerName[0]
            : undefined;
          if (propertyForLayerName) {
            geoServiceAssociations.push({
              url: value,
              urlProperty: key,
              layerNameProperty: propertyForLayerName,
              geoService
            });
          }
        }
      });
    });
    const geoServiceStates: {
      geoServiceAssociation: GeoServiceAssociation;
      state: any;
    }[] = [];
    geoServiceAssociations.map((geoServiceAssociation) => {
      const url = geoServiceAssociation.url;
      const type = geoServiceAssociation.geoService.type || 'wms';
      distinctValues[geoServiceAssociation.layerNameProperty].map(
        (layerName) => {
          let appliedLayerName = layerName;
          let arcgisLayerName = undefined;
          if (
            ['arcgisrest', 'imagearcgisrest', 'tilearcgisrest'].includes(type)
          ) {
            appliedLayerName = undefined;
            arcgisLayerName = layerName;
          }
          const so = ObjectUtils.removeUndefined({
            sourceOptions: {
              type: type || 'wms',
              url,
              optionsFromCapabilities: true,
              optionsFromApi: true,
              params: {
                LAYERS: appliedLayerName,
                LAYER: arcgisLayerName
              }
            }
          });
          const potentialLayerId = generateIdFromSourceOptions(
            so.sourceOptions
          );
          geoServiceStates.push({
            geoServiceAssociation,
            state: {
              added: layersId.find((l) => l === potentialLayerId) !== undefined,
              haveGeoServiceProperties: true,
              type,
              url,
              layerName
            }
          });
        }
      );
    });
    geoServiceStates.map((geoServiceState) => {
      const urlProperty = geoServiceState.geoServiceAssociation.urlProperty;
      const layerNameProperty =
        geoServiceState.geoServiceAssociation.layerNameProperty;

      const urlValue = geoServiceState.state.url;
      const layerNameValue = geoServiceState.state.layerName;
      const entitiesToProcess = entities.filter(
        (e) =>
          e.properties[urlProperty] === urlValue &&
          e.properties[layerNameProperty] === layerNameValue
      );
      const ns = {
        geoService: geoServiceState.state
      };
      store.state.updateMany(entitiesToProcess, ns, true);
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
    this.states$$.map((state) => state.unsubscribe());
    if (this.empty$$) {
      this.empty$$.unsubscribe();
    }
  }
}

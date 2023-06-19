import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ActionStore,
  EntityStoreFilterSelectionStrategy
} from '@igo2/common';

import {
  FeatureStore,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy,
  FeatureStoreInMapExtentStrategy,
  FeatureMotion,
  FeatureStoreInMapResolutionStrategy,
  GeoPropertiesStrategy
} from '../../feature';
import { LayerService, VectorLayer } from '../../layer';
import { GeoWorkspaceOptions } from '../../layer/shared/layers/layer.interface';
import { IgoMap } from '../../map';
import { FeatureDataSource, CapabilitiesService } from '../../datasource';
import { PropertyTypeDetectorService} from '../../utils';
import { getCommonVectorSelectedStyle } from '../../style/shared/vector/commonVectorStyle';

import { WfsWorkspace } from './wfs-workspace';
import { StorageService, ConfigService } from '@igo2/core';
import { createFilterInMapExtentOrResolutionStrategy, createTableTemplate } from './workspace.utils';
@Injectable({
  providedIn: 'root'
})
export class WfsWorkspaceService {

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  public ws$ = new BehaviorSubject<string>(undefined);

  constructor(
    private storageService: StorageService,
    private configService: ConfigService,
    private layerService: LayerService,
    private propertyTypeDetectorService: PropertyTypeDetectorService,
    private capabilitiesService: CapabilitiesService) {}

  createWorkspace(layer: VectorLayer, map: IgoMap): WfsWorkspace {
    if (layer.options.workspace?.enabled === false || layer.dataSource.options.edition) {
      return;
    }

    layer.options.workspace = Object.assign({}, layer.options.workspace,
      {
        srcId: layer.id,
        workspaceId: layer.id,
        enabled: true
      } as GeoWorkspaceOptions);

    const wks = new WfsWorkspace({
      id: layer.id,
      title: layer.title,
      layer,
      map,
      entityStore: this.createFeatureStore(layer, map),
      actionStore: new ActionStore([]),
      meta: {
        tableTemplate: undefined
      }
    });
    createTableTemplate(wks, layer, this.layerService, this.ws$);
    return wks;
  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], {map});
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const inMapExtentStrategy = new FeatureStoreInMapExtentStrategy({});
    const geoPropertiesStrategy = new GeoPropertiesStrategy({ map }, this.propertyTypeDetectorService, this.capabilitiesService);
    const inMapResolutionStrategy = new FeatureStoreInMapResolutionStrategy({});
    const selectedRecordStrategy = new EntityStoreFilterSelectionStrategy({});
    const confQueryOverlayStyle= this.configService.getConfig('queryOverlayStyle');

    const selectionStrategy = new FeatureStoreSelectionStrategy({
      layer: new VectorLayer({
        zIndex: 300,
        source: new FeatureDataSource(),
        style: (feature) => {
          return getCommonVectorSelectedStyle(Object.assign({}, {feature}, confQueryOverlayStyle.selection || {}));
        },
        showInLayerList: false,
        exportable: false,
        browsable: false
      }),
      map,
      hitTolerance: 15,
      motion: this.zoomAuto ? FeatureMotion.Default : FeatureMotion.None,
      many: true,
      dragBox: true
    });
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(inMapExtentStrategy, true);
    store.addStrategy(geoPropertiesStrategy, true);
    store.addStrategy(inMapResolutionStrategy, true);
    store.addStrategy(selectionStrategy, true);
    store.addStrategy(selectedRecordStrategy, false);
    store.addStrategy(createFilterInMapExtentOrResolutionStrategy(), true);
    return store;
  }
}

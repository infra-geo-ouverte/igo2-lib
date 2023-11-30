import { Injectable } from '@angular/core';

import { ActionStore, EntityStoreFilterSelectionStrategy } from '@igo2/common';
import { ConfigService, StorageService } from '@igo2/core';

import { BehaviorSubject } from 'rxjs';

import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import { FeatureDataSource } from '../../datasource/shared/datasources';
import {
  FeatureMotion,
  FeatureStore,
  FeatureStoreInMapExtentStrategy,
  FeatureStoreInMapResolutionStrategy,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy,
  GeoPropertiesStrategy
} from '../../feature/shared';
import {
  GeoWorkspaceOptions,
  LayerService,
  VectorLayer
} from '../../layer/shared';
import { IgoMap } from '../../map/shared/map';
import {
  FeatureCommonVectorStyleOptions,
  OverlayStyleOptions,
  getCommonVectorSelectedStyle
} from '../../style/shared';
import { PropertyTypeDetectorService } from '../../utils/propertyTypeDetector';
import { WfsWorkspace } from './wfs-workspace';
import {
  createFilterInMapExtentOrResolutionStrategy,
  createTableTemplate
} from './workspace.utils';

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
    private capabilitiesService: CapabilitiesService
  ) {}

  createWorkspace(layer: VectorLayer, map: IgoMap): WfsWorkspace {
    if (
      layer.options.workspace?.enabled === false ||
      layer.dataSource.options.edition
    ) {
      return;
    }

    layer.options.workspace = Object.assign({}, layer.options.workspace, {
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
    const store = new FeatureStore([], { map });
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const inMapExtentStrategy = new FeatureStoreInMapExtentStrategy({});
    const geoPropertiesStrategy = new GeoPropertiesStrategy(
      { map },
      this.propertyTypeDetectorService,
      this.capabilitiesService
    );
    const inMapResolutionStrategy = new FeatureStoreInMapResolutionStrategy({});
    const selectedRecordStrategy = new EntityStoreFilterSelectionStrategy({});
    const confQueryOverlayStyle: OverlayStyleOptions =
      this.configService.getConfig('queryOverlayStyle');

    const selectionStrategy = new FeatureStoreSelectionStrategy({
      layer: new VectorLayer({
        zIndex: 300,
        source: new FeatureDataSource(),
        style: (feature) => {
          return getCommonVectorSelectedStyle(
            Object.assign(
              {},
              { feature },
              confQueryOverlayStyle?.selection || {}
            ) as FeatureCommonVectorStyleOptions
          );
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

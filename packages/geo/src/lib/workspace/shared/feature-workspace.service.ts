import { Injectable, inject } from '@angular/core';

import { ActionStore } from '@igo2/common/action';
import { EntityStoreFilterSelectionStrategy } from '@igo2/common/entity';
import { ConfigService } from '@igo2/core/config';
import { StorageService } from '@igo2/core/storage';

import { BehaviorSubject } from 'rxjs';

import { CapabilitiesService } from '../../datasource/shared/capabilities.service';
import { FeatureDataSource } from '../../datasource/shared/datasources';
import {
  FeatureMotion,
  FeatureStore,
  FeatureStoreInMapExtentStrategy,
  FeatureStoreInMapResolutionStrategy,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSearchIndexStrategy,
  FeatureStoreSelectionStrategy,
  GeoPropertiesStrategy
} from '../../feature/shared';
import { LayerService, VectorLayer } from '../../layer/shared';
import { GeoWorkspaceOptions } from '../../layer/shared/layers/layer.interface';
import { IgoMap } from '../../map/shared/map';
import {
  FeatureCommonVectorStyleOptions,
  OverlayStyleOptions,
  getCommonVectorSelectedStyle
} from '../../style/shared';
import { PropertyTypeDetectorService } from '../../utils/propertyTypeDetector/propertyTypeDetector.service';
import { FeatureWorkspace } from './feature-workspace';
import {
  createFilterInMapExtentOrResolutionStrategy,
  createTableTemplate
} from './workspace.utils';

@Injectable({
  providedIn: 'root'
})
export class FeatureWorkspaceService {
  private storageService = inject(StorageService);
  private configService = inject(ConfigService);
  private layerService = inject(LayerService);
  private propertyTypeDetectorService = inject(PropertyTypeDetectorService);
  private capabilitiesService = inject(CapabilitiesService);

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  public ws$ = new BehaviorSubject<string>(undefined);

  createWorkspace(layer: VectorLayer, map: IgoMap): FeatureWorkspace {
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

    if (!layer.options.linkedLayers) {
      layer.options.linkedLayers = { linkId: layer.id, links: [] };
    }

    const wks = new FeatureWorkspace({
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
    const searchStrategy = new FeatureStoreSearchIndexStrategy({
      percentDistinctValueRatio: 2,
      sourceFields: layer.dataSource.options.sourceFields
    });
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
    if (layer.options.workspace?.searchIndexEnabled) {
      store.addStrategy(searchStrategy, true);
    }
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

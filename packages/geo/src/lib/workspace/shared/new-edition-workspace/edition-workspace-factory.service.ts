import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ActionStore, EntityStoreFilterSelectionStrategy } from '@igo2/common';
import { ConfigService } from '@igo2/core/config';
import { StorageService } from '@igo2/core/storage';

import { FeatureDataSource } from '../../../datasource/shared/datasources/feature-datasource';
import {
  FeatureMotion,
  FeatureStore,
  FeatureStoreInMapExtentStrategy,
  FeatureStoreInMapResolutionStrategy,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy
} from '../../../feature/shared';
import {
  GeoWorkspaceOptions,
  ImageLayer,
  VectorLayer
} from '../../../layer/shared';
import { IgoMap } from '../../../map/shared';
import { createFilterInMapExtentOrResolutionStrategy } from '../workspace.utils';
import { EditionWorkspaceTableTemplateFactory } from './edition-table-template-factory';
import { NewEditionWorkspace } from './new-edition-workspace';
import { RestAPIEdition } from './rest-api-edition';

@Injectable({
  providedIn: 'root'
})
export class EditionWorkspaceFactoryService {
  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  private tableTemplateFactory = new EditionWorkspaceTableTemplateFactory();

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private configService: ConfigService,
    private dialog: MatDialog
  ) {}

  createWFSEditionWorkspace(
    layer: VectorLayer,
    map: IgoMap
  ): NewEditionWorkspace {
    const workspace = new RestAPIEdition(this.http, this.dialog, {
      id: layer.id,
      title: layer.title,
      layer,
      map,
      editionUrl: this.getEditionUrl(layer),
      entityStore: this.createFeatureStore(layer, map),
      actionStore: new ActionStore([]),
      meta: {
        tableTemplate: undefined
      }
    });

    this.tableTemplateFactory.addTemplateToWorkspace(workspace, layer);
    layer.options.workspace = Object.assign({}, layer.options.workspace, {
      srcId: layer.id,
      workspaceId: layer.id,
      enabled: true
    } as GeoWorkspaceOptions);
    return workspace;
  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], { map });
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const inMapExtentStrategy = new FeatureStoreInMapExtentStrategy({});
    const inMapResolutionStrategy = new FeatureStoreInMapResolutionStrategy({});
    const selectedRecordStrategy = new EntityStoreFilterSelectionStrategy({});
    const selectionStrategy = new FeatureStoreSelectionStrategy({
      layer: new VectorLayer({
        zIndex: 300,
        source: new FeatureDataSource(),
        style: undefined,
        showInLayerList: false,
        exportable: false,
        browsable: false
      }),
      map,
      hitTolerance: 15,
      motion: this.zoomAuto ? FeatureMotion.Default : FeatureMotion.None,
      many: true,
      dragBox: true
    }); // TODO check if usefull
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(inMapExtentStrategy, true);
    store.addStrategy(inMapResolutionStrategy, true);
    store.addStrategy(selectionStrategy, true);
    store.addStrategy(selectedRecordStrategy, false);
    store.addStrategy(createFilterInMapExtentOrResolutionStrategy(), true);
    return store;
  }

  private getEditionUrl(layer: VectorLayer | ImageLayer): string {
    const editionUrl = layer.dataSource.options.edition.baseUrl;
    const baseUrl = this.configService.getConfig('edition.url');
    return !baseUrl ? editionUrl : new URL(editionUrl, baseUrl).href;
  }
}

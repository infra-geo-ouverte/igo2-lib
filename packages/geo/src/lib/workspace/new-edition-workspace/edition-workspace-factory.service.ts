import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ActionStore } from '@igo2/common/action';
import {
  EntityStore,
  EntityStoreFilterSelectionStrategy
} from '@igo2/common/entity';
import { ConfigService } from '@igo2/core/config';
import { MessageService } from '@igo2/core/message';
import { StorageService } from '@igo2/core/storage';

import { FeatureDataSource } from '../../datasource/shared/datasources/feature-datasource';
import {
  Feature,
  FeatureMotion,
  FeatureStore,
  FeatureStoreInMapExtentStrategy,
  FeatureStoreInMapResolutionStrategy,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy
} from '../../feature/shared';
import {
  GeoWorkspaceOptions,
  ImageLayer,
  LayerService,
  VectorLayer,
  VectorLayerOptions
} from '../../layer/shared';
import { IgoMap } from '../../map/shared';
import { createFilterInMapExtentOrResolutionStrategy } from '../shared/workspace.utils';
import { EditionWorkspaceTableTemplateFactory } from './edition-table-template-factory';
import { NewEditionWorkspace } from './new-edition-workspace';
import { EditionOverlay } from './rendering/edition-overlay';
import { EditionVerb } from './strategy/edition-strategy';
import { OgcApiEditionStrategy } from './strategy/ogc-api-edition-strategy';

@Injectable({
  providedIn: 'root'
})
export class EditionWorkspaceFactoryService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);
  private configService = inject(ConfigService);
  private layerService = inject(LayerService);
  private messageService = inject(MessageService);
  private dialog = inject(MatDialog);

  private tableTemplateFactory = new EditionWorkspaceTableTemplateFactory();

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  createWFSEditionWorkspace(
    layer: VectorLayer,
    map: IgoMap
  ): NewEditionWorkspace {
    const editionStrategy = new OgcApiEditionStrategy(this.http, {
      baseUrl: this.getEditionUrl(layer),
      collectionName:
        (layer.dataSource as FeatureDataSource).options.collectionName ?? '',
      featureIdField: (layer.dataSource as FeatureDataSource).options
        .featureIdField,
      verb:
        (layer.dataSource.options.edition?.modifyMethod?.toUpperCase() as EditionVerb) ?? // todo: code smell
        'PUT'
    });

    const overlay = new EditionOverlay(
      map,
      layer.dataSource.options.edition?.geomType ?? 'Point' // todo: find geometry in layer.datasource?
    );

    const workspace = new NewEditionWorkspace(
      editionStrategy,
      overlay,
      this.dialog,
      this.messageService,
      {
        id: layer!.id!,
        title: layer!.title!,
        layer,
        map,
        editionUrl: this.getEditionUrl(layer),
        entityStore: this.createFeatureStore(
          layer,
          map
        ) as unknown as EntityStore,
        actionStore: new ActionStore([]),
        meta: {
          tableTemplate: undefined
        }
      }
    );

    this.tableTemplateFactory.addTemplateToWorkspace(workspace, layer);
    layer.options.workspace = Object.assign({}, layer.options.workspace, {
      srcId: layer.id,
      workspaceId: layer.id,
      enabled: true
    } as GeoWorkspaceOptions);
    return workspace;
  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([] as Feature[], { map });
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const inMapExtentStrategy = new FeatureStoreInMapExtentStrategy({});
    const inMapResolutionStrategy = new FeatureStoreInMapResolutionStrategy({});
    const selectedRecordStrategy = new EntityStoreFilterSelectionStrategy({});
    const selectionStrategy = new FeatureStoreSelectionStrategy({
      layer: this.layerService.createLayer({
        zIndex: 300,
        source: new FeatureDataSource(),
        style: undefined,
        showInLayerList: false,
        exportable: false,
        browsable: false
      } satisfies VectorLayerOptions) as VectorLayer,
      map,
      hitTolerance: 15,
      motion: this.zoomAuto ? FeatureMotion.Default : FeatureMotion.None,
      many: true,
      dragBox: true
    });
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(inMapExtentStrategy, true);
    store.addStrategy(inMapResolutionStrategy, true);
    store.addStrategy(selectionStrategy, true);
    store.addStrategy(selectedRecordStrategy, false);
    store.addStrategy(createFilterInMapExtentOrResolutionStrategy(), true);
    return store as FeatureStore<Feature>;
  }

  private getEditionUrl(layer: VectorLayer | ImageLayer): string {
    const editionUrl = layer.dataSource.options.edition?.baseUrl;
    const baseUrl = this.configService.getConfig('edition.url');
    // TODO Pas sur... j'ai mis le ?? ''. Possible de trouver quelque chose de + robuste.
    return !baseUrl
      ? (editionUrl ?? '')
      : new URL(editionUrl ?? '', baseUrl).href;
  }
}

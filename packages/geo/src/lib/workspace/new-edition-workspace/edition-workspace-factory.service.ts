import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ActionStore } from '@igo2/common/action';
import {
  EntityStore,
  EntityStoreFilterSelectionStrategy,
  EntityTableColumnRenderer
} from '@igo2/common/entity';
import { ConfigService } from '@igo2/core/config';
import { MessageService } from '@igo2/core/message';
import { StorageService } from '@igo2/core/storage';

import olFeature from 'ol/Feature';
import type { default as OlGeometry } from 'ol/geom/Geometry';

import { skipWhile, take } from 'rxjs';

import { SourceFieldsOptionsParams } from '../../datasource/shared';
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
import { createEditionTableActions } from './edition-table-actions';
import { EditionTableTemplateComposer } from './edition-table-template-composer';
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

  private composer = new EditionTableTemplateComposer();

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  createOgcApiEditionWorkspace(
    layer: VectorLayer,
    map: IgoMap
  ): NewEditionWorkspace {
    const headers = layer.dataSource.options.edition?.modifyHeaders ?? {};

    const editionStrategy = new OgcApiEditionStrategy(this.http, {
      baseUrl: this.getEditionUrl(layer),
      collectionName:
        (layer.dataSource as FeatureDataSource).options.collectionName ?? '',
      featureIdField: (layer.dataSource as FeatureDataSource).options
        .featureIdField,
      verb:
        (layer.dataSource.options.edition?.modifyMethod?.toUpperCase() as EditionVerb) ?? // todo: code smell
        'PUT',
      headers: headers,
      columns: [] // todo ? pourquoi
    });

    const overlay = new EditionOverlay(
      map,
      layer.dataSource.options.edition?.geomType ?? 'Point' // todo: find geometry in layer.datasource?
    );

    const featureStore = this.createFeatureStore(
      layer,
      map
    ) as unknown as EntityStore; // todo: code smell

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
        entityStore: featureStore,
        actionStore: new ActionStore([]),
        meta: {
          tableTemplate: undefined
        }
      }
    );

    const fields = layer.dataSource.options.sourceFields;
    const relations = layer.dataSource.options.relations ?? [];
    const actions = createEditionTableActions(workspace);

    if (fields) {
      workspace.meta.tableTemplate = this.composer.compose({
        fields,
        relations,
        actions
      });
    } else {
      workspace
        .entityStore!.entities$.pipe(
          skipWhile((val) => val.length === 0),
          take(1)
        )
        .subscribe((entities) => {
          const derivedFields = this.deriveFieldsFromEntity(
            entities[0] as Feature
          );
          workspace.meta.tableTemplate = this.composer.compose({
            fields: derivedFields,
            relations,
            actions
          });
        });
    }

    layer.options.workspace = Object.assign({}, layer.options.workspace, {
      srcId: layer.id,
      workspaceId: layer.id,
      enabled: true
    } as GeoWorkspaceOptions);
    return workspace;
  }

  private deriveFieldsFromEntity(
    feature: Feature
  ): SourceFieldsOptionsParams[] {
    const ol = feature.ol as olFeature<OlGeometry>;
    const columnsFromFeatures = ol
      .getKeys()
      .filter(
        (col) =>
          !col.startsWith('_') &&
          col !== 'geometry' &&
          col !== ol.getGeometryName() &&
          !col.match(/boundedby/gi)
      )
      .map((key) => {
        return {
          name: `properties.${key}`,
          title: key,
          renderer: EntityTableColumnRenderer.UnsanitizedHTML
        };
      });

    return columnsFromFeatures;
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

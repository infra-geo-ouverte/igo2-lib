import { Injectable } from '@angular/core';

import {
  ActionStore,
  EntityTableTemplate,
  EntityStoreFilterCustomFuncStrategy,
  EntityRecord,
  EntityStoreStrategyFuncOptions,
  EntityStoreFilterSelectionStrategy
} from '@igo2/common';

import {
  FeatureStore,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy,
  FeatureStoreInMapExtentStrategy,
  Feature,
  FeatureMotion
} from '../../feature';
import { VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { SourceFieldsOptionsParams, FeatureDataSource } from '../../datasource';

import { WfsWorkspace } from './wfs-workspace';
import { skipWhile, take } from 'rxjs/operators';
import { StorageService, StorageScope } from '@igo2/core';

@Injectable({
  providedIn: 'root'
})
export class WfsWorkspaceService {

  get zoomAuto(): boolean {
    return this.storageService.get('zoomAuto') as boolean;
  }

  constructor(
    private storageService: StorageService
    ) {}

    createWorkspace(layer: VectorLayer, map: IgoMap): WfsWorkspace {
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
    this.createTableTemplate(wks, layer);
    return wks;

  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], {map});
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const inMapExtentStrategy = new FeatureStoreInMapExtentStrategy({});
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
    });
    this.storageService.set('rowsInMapExtent', true, StorageScope.SESSION);
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(inMapExtentStrategy, true);
    store.addStrategy(selectionStrategy, true);
    store.addStrategy(selectedRecordStrategy, false);
    store.addStrategy(this.createFilterInMapExtentStrategy(), true);
    return store;
  }

  private createTableTemplate(workspace: WfsWorkspace,  layer: VectorLayer): EntityTableTemplate {
    const fields = layer.dataSource.options.sourceFields || [];

    if (fields.length === 0) {
      workspace.entityStore.entities$.pipe(
        skipWhile(val => val.length === 0),
        take(1)
      ).subscribe(entities => {
        const columnsFromFeatures = (entities[0] as Feature).ol.getKeys()
        .filter(
          col => !col.startsWith('_') &&
          col !== 'geometry' &&
          col !== (entities[0] as Feature).ol.getGeometryName() &&
          !col.match(/boundedby/gi))
        .map(key => {
          return {
            name: `properties.${key}`,
            title: key
          };
        });
        workspace.meta.tableTemplate = {
          selection: true,
          sort: true,
          columns: columnsFromFeatures
        };
      });
      return;
    }
    const columns = fields.map((field: SourceFieldsOptionsParams) => {
      return {
        name: `properties.${field.name}`,
        title: field.alias ? field.alias : field.name
      };
    });
    workspace.meta.tableTemplate = {
      selection: true,
      sort: true,
      columns
    };
  }

  private createFilterInMapExtentStrategy(): EntityStoreFilterCustomFuncStrategy {
    const filterClauseFunc = (record: EntityRecord<object>) => {
      return record.state.inMapExtent === true;
    };
    return new EntityStoreFilterCustomFuncStrategy({filterClauseFunc} as EntityStoreStrategyFuncOptions);
  }
}

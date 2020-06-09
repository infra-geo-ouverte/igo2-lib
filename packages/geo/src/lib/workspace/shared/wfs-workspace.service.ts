import { Injectable } from '@angular/core';

import {
  ActionStore,
  EntityTableTemplate,
  EntityStoreFilterCustomFuncStrategy,
  EntityStoreStrategyFuncOptions,
  EntityRecord
} from '@igo2/common';

import {
  FeatureStore,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy
} from '../../feature';
import { VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { SourceFieldsOptionsParams } from '../../datasource';

import { WfsWorkspace } from './wfs-workspace';
import { WfsActionsService } from './wfs-actions.service';

@Injectable({
  providedIn: 'root'
})
export class WfsWorkspaceService {

  constructor(private wfsActionsService: WfsActionsService) {}

  createWorkspace(layer: VectorLayer, map: IgoMap): WfsWorkspace {
    const wks = new WfsWorkspace({
      id: layer.id,
      title: layer.title,
      layer,
      map,
      entityStore: this.createFeatureStore(layer, map),
      actionStore: new ActionStore([]),
      meta: {
        tableTemplate: this.createTableTemplate(layer)
      }
    });
    wks.actionStore.insertMany(this.wfsActionsService.buildActions(wks));
    return wks;

  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], {map});
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const selectionStrategy = new FeatureStoreSelectionStrategy({
      map,
      hitTolerance: 10
    });
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(selectionStrategy, true);
    store.addStrategy(this.createFilterInMapExtentStrategy(), false);
    return store;
  }

  private createTableTemplate(layer: VectorLayer): EntityTableTemplate {
    const fields = layer.dataSource.options.sourceFields || [];
    const columns = fields.map((field: SourceFieldsOptionsParams) => {
      return {
        name: `properties.${field.name}`,
        title: field.alias ? field.alias : field.name
      };
    });

    return {
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

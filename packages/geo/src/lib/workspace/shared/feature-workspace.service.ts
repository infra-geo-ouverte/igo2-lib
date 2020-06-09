import { Injectable } from '@angular/core';

import {
  ActionStore,
  EntityTableTemplate,
  EntityStoreFilterSelectionStrategy,
  EntityStoreFilterCustomFuncStrategy,
  EntityRecord,
  EntityStoreStrategyFuncOptions
} from '@igo2/common';

import {
  FeatureStore,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy
} from '../../feature';
import { VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { SourceFieldsOptionsParams } from '../../datasource';

import { FeatureWorkspace } from './feature-workspace';
import { FeatureActionsService } from './feature-actions.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureWorkspaceService {

  constructor(private featureActionsService: FeatureActionsService) {}

  createWorkspace(layer: VectorLayer, map: IgoMap): FeatureWorkspace {
    const wks = new FeatureWorkspace({
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
    this.featureActionsService.loadActions(wks);
    return wks;

  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], {map});
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const selectionStrategy = new FeatureStoreSelectionStrategy({
      map,
      hitTolerance: 15
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

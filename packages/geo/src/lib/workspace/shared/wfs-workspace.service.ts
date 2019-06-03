import { Injectable } from '@angular/core';

import {
  ActionStore,
  EntityTableTemplate
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

@Injectable({
  providedIn: 'root'
})
export class WfsWorkspaceService {

  constructor() {}

  createWorkspace(layer: VectorLayer, map: IgoMap): WfsWorkspace {
    return new WfsWorkspace({
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
  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], {map});
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
    const selectionStrategy = new FeatureStoreSelectionStrategy({
      map,
      hitTolerance: 5
    });
    store.addStrategy(loadingStrategy, true);
    store.addStrategy(selectionStrategy, true);

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

}

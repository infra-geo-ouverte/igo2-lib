import { Inject, Injectable } from '@angular/core';

import { OlFeature } from 'ol/Feature';

import {
  Action,
  ActionStore,
  Editor,
  EntityTableTemplate,
  Widget
} from '@igo2/common';

import {
  FeatureStore,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy
} from '../../feature';
import { VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { SourceFieldsOptionsParams } from '../../datasource';

import { WfsOgcFilterWidget } from './wfs.widgets';

@Injectable({
  providedIn: 'root'
})
export class WfsEditorService {

  constructor(
    @Inject(WfsOgcFilterWidget) private wfsOgcFilterWidget: Widget
  ) {}

  createEditor(layer: VectorLayer, map: IgoMap): Editor {
    const actionStore = new ActionStore([]);
    const editor = new Editor({
      id: layer.id,
      title: layer.title,
      tableTemplate: this.createTableTemplate(layer),
      entityStore: this.createFeatureStore(layer, map),
      actionStore
    });
    actionStore.load(this.buildActions(editor));

    return editor;
  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], {map});
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy();
    const selectionStrategy = new FeatureStoreSelectionStrategy({
      map,
      hitTolerance: 5
    });
    store.addStrategy(loadingStrategy);
    store.addStrategy(selectionStrategy);

    loadingStrategy.activate();
    selectionStrategy.activate();

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

  private buildActions(editor: Editor): Action[] {
    const layer = (editor.entityStore as FeatureStore).layer;
    return [
      {
        id: 'wfsOgcFilter',
        icon: 'filter_list',
        title: 'igo.geo.edition.wfsOgcFilter.title',
        tooltip: 'igo.geo.edition.wfsOgcFilter.tooltip',
        handler: () => editor.activateWidget(this.wfsOgcFilterWidget, {
          layer,
          map: layer.map,
        }),
        conditions: []
      }
    ];
  }

}

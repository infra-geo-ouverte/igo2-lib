import { Inject, Injectable } from '@angular/core';

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

import { WfsOgcFilterWidget } from '../wfs-ogc-filter/wfs-ogc-filter.widget'

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
      actionStore: actionStore  
    });
    actionStore.load(this.buildActions(editor));
  
    return editor;
  }
  
  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], {
      map: map
    });
    store.bindLayer(layer);
    
    const loadingStrategy = new FeatureStoreLoadingLayerStrategy();
    const selectionStrategy = new FeatureStoreSelectionStrategy({
      map: map
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
      }
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
<<<<<<< HEAD
        title: 'igo.geo.wfs.ogcFilter.title',
        tooltip: 'igo.geo.wfs.ogcFilter.tooltip',
=======
        title: 'menu',
        tooltip: 'menu',
>>>>>>> wip(wfs): wfs editor with table and widgets
        handler: () => editor.activateWidget(this.wfsOgcFilterWidget, {
          layer: layer,
          map: layer.map,
        }),
        conditions: []
      }
    ];
  }

}

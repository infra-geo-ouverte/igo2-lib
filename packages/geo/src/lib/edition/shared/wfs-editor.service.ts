import { Inject, Injectable } from '@angular/core';

import { OlFeature } from 'ol/Feature';

import {
  Action,
  ActionStore,
  Editor,
  EntityTableTemplate,
  Widget
} from '@igo2/common';

import { DownloadService } from '../../download';
import {
  FeatureStore,
  FeatureStoreLoadingLayerStrategy,
  FeatureStoreSelectionStrategy
} from '../../feature';
import { VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { SourceFieldsOptionsParams } from '../../datasource';

import { OgcFilterWidget } from './widgets';

@Injectable({
  providedIn: 'root'
})
export class WfsEditorService {

  constructor(
    @Inject(OgcFilterWidget) private ogcFilterWidget: Widget,
    private downloadService: DownloadService
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
    actionStore.load(this.buildActions(editor, layer, map));

    return editor;
  }

  private createFeatureStore(layer: VectorLayer, map: IgoMap): FeatureStore {
    const store = new FeatureStore([], {map});
    store.bindLayer(layer);

    const loadingStrategy = new FeatureStoreLoadingLayerStrategy({});
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

  private buildActions(editor: Editor, layer: VectorLayer, map: IgoMap): Action[] {
    return [
      {
        id: 'ogcFilter',
        icon: 'filter_list',
        title: 'igo.geo.edition.ogcFilter.title',
        tooltip: 'igo.geo.edition.ogcFilter.tooltip',
        handler: () => editor.activateWidget(this.ogcFilterWidget, {
          layer,
          map,
        }),
        conditions: []
      },
      {
        id: 'wfsDownload',
        icon: 'file_download',
        title: 'igo.geo.edition.wfsDownload.title',
        tooltip: 'igo.geo.edition.wfsDownload.tooltip',
        handler: () => this.downloadService.open(layer),
        conditions: []
      }
    ];
  }

}

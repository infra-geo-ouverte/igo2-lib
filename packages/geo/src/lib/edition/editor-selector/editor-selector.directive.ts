import { Directive, Input, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { Editor, EditorStore, EditorSelectorComponent } from '@igo2/common';

import { Layer, ImageLayer, VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { WFSDataSource, WMSDataSource } from '../../datasource';
import { FeatureStore } from '../../feature';
import { OgcFilterableDataSourceOptions } from '../../filter';

import { WfsEditorService } from '../shared/wfs-editor.service';
import { WmsEditorService } from '../shared/wms-editor.service';

@Directive({
  selector: '[igoEditorSelector]'
})
export class EditorSelectorDirective implements OnInit, OnDestroy {
  private layers$$: Subscription;

  @Input() map: IgoMap;

  get editorStore(): EditorStore {
    return this.component.store;
  }

  constructor(
    private component: EditorSelectorComponent,
    private wfsEditorService: WfsEditorService,
    private wmsEditorService: WmsEditorService
  ) {}

  ngOnInit() {
    this.layers$$ = this.map.layers$.subscribe((layers: Layer[]) =>
      this.onLayersChange(layers)
    );
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

  private onLayersChange(layers: Layer[]) {
    const editableLayers = layers.filter((layer: Layer) =>
      this.layerIsEditable(layer)
    );
    const editableLayersIds = editableLayers.map((layer: Layer) => layer.id);

    const editorsToAdd = editableLayers
      .map((layer: VectorLayer) => this.getOrCreateEditor(layer))
      .filter((editor: Editor | undefined) => editor !== undefined);

    const editorsToRemove = this.editorStore.all()
      .filter((editor: Editor) => {
        return editableLayersIds.indexOf(editor.id) < 0;
      });

    if (editorsToRemove.length > 0) {
      this.editorStore.deleteMany(editorsToRemove);
    }

    if (editorsToAdd.length > 0) {
      this.editorStore.insertMany(editorsToAdd);
    }
  }

  private getOrCreateEditor(layer: VectorLayer | ImageLayer): Editor | undefined {
    const editor = this.editorStore.get(layer.id);
    if (editor !== undefined) {
      return;
    }
    if (layer.dataSource instanceof WFSDataSource) {
      return this.wfsEditorService.createEditor(layer as VectorLayer, this.map);
    } else if (layer.dataSource instanceof WMSDataSource) {
      return this.wmsEditorService.createEditor(layer as ImageLayer, this.map);
    }

    return;
  }

  private layerIsEditable(layer: Layer): boolean {
    const dataSource = layer.dataSource;
    if (dataSource instanceof WFSDataSource) {
      return true;
    }

    if (dataSource instanceof WMSDataSource) {
      const dataSourceOptions = (dataSource.options ||
        {}) as OgcFilterableDataSourceOptions;
      return (
        dataSourceOptions.ogcFilters && dataSourceOptions.ogcFilters.enabled
      );
    }

    return false;
  }
}

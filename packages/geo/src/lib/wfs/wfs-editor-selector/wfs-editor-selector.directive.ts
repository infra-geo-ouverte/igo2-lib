import { Directive, Input, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import {
  Editor,
  EditorSelectorComponent,
  EntityStore
} from '@igo2/common';

import { Layer, VectorLayer } from '../../layer';
import { IgoMap } from '../../map';
import { WFSDataSource } from '../../datasource';

import { WfsEditorService } from '../shared/wfs-editor.service';

@Directive({
  selector: '[igoWfsEditorSelector]'
})
export class WfsEditorSelectorDirective implements OnInit, OnDestroy {

  private layers$$: Subscription;

  @Input() map: IgoMap;

  get editorStore(): EntityStore<Editor> {
    return this.component.store;
  }

  constructor(
    private component: EditorSelectorComponent,
    private wfsEditorService: WfsEditorService
  ) {}

  ngOnInit() {
    this.layers$$ = this.map.layers$
      .subscribe((layers: Layer[]) => this.onLayersChange(layers));
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

  private onLayersChange(layers: Layer[]) {
    const wfsLayers = layers.filter((layer: Layer) => {
      return layer.dataSource instanceof WFSDataSource;
    });

    const editors = wfsLayers.map((layer: VectorLayer) => {
      return this.getOrCreateEditor(layer);
    });
    this.editorStore.updateMany(editors);
  }

  private getOrCreateEditor(layer: VectorLayer): Editor {
    let editor = this.editorStore.get(layer.id);
    if (editor !== undefined) {
      return editor;
    }
    return this.wfsEditorService.createEditor(layer, this.map);
  }

}

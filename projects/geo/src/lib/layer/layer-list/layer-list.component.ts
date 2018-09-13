import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  TemplateRef,
  ContentChild
} from '@angular/core';

import { Layer } from '../shared';

@Component({
  selector: 'igo-layer-list',
  templateUrl: './layer-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerListComponent {
  public keyword;
  public sortedAlpha = false;
  public onlyVisible = false;
  public hasLayerNotVisible = false;
  public hasLayerOutOfRange = false;
  public onlyInRange = false;

  @ContentChild('igoLayerItemToolbar') templateLayerToolbar: TemplateRef<any>;

  @Input()
  get layers(): Layer[] {
    if (this._layers.filter(f => f.visible === false).length >= 1 ) {
      this.hasLayerNotVisible = true;
    } else {
      this.hasLayerNotVisible = false;
    }
    if (this._layers.filter(f => f.isInResolutionsRange === false).length >= 1 ) {
      this.hasLayerOutOfRange = true;
    } else {
      this.hasLayerOutOfRange = false;
    }

    // https://stackoverflow.com/questions/17099029/how-to-filter-a-javascript-object-array-with-variable-parameters
    if (this.keyword || this.onlyInRange || this.onlyVisible) {
      const layerIDToKeep = [];
      this._layers.forEach(layer => {
        layerIDToKeep.push(layer.id);
      });

      this._layers.forEach(layer => {
        if (this.keyword) {
          const localKeyword = this.keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const localLayerTitle = layer.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (
            !new RegExp(localKeyword, 'gi').test(localLayerTitle) &&
            !(this.keyword.toLowerCase() === layer.dataSource.options.type.toString().toLowerCase()) ) {
            const index = layerIDToKeep.indexOf(layer.id);
            if (index > -1) {
              layerIDToKeep.splice(index, 1);
            }
          }
        }
        if (this.onlyVisible && layer.visible === false) {
          const index = layerIDToKeep.indexOf(layer.id);
            if (index > -1) {
              layerIDToKeep.splice(index, 1);
            }
        }
        if (this.onlyInRange && layer.isInResolutionsRange === false) {
          const index = layerIDToKeep.indexOf(layer.id);
            if (index > -1) {
              layerIDToKeep.splice(index, 1);
            }
        }
      });
      return this._layers
      .filter(layer =>
        layerIDToKeep.indexOf(layer.id) !== -1
      );

    } else {
      return this._layers;
    }
  }
  set layers(value: Layer[]) {
    this._layers = value;
    this.cdRef.detectChanges();
  }
  private _layers: Layer[] = [];

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  @Input()
  get excludeBaseLayers() {
    return this._excludeBaseLayers;
  }
  set excludeBaseLayers(value: boolean) {
    this._excludeBaseLayers = value;
  }
  private _excludeBaseLayers = false;

  @Input()
  get toggleLegendOnVisibilityChange() {
    return this._toggleLegendOnVisibilityChange;
  }
  set toggleLegendOnVisibilityChange(value: boolean) {
    this._toggleLegendOnVisibilityChange = value;
  }
  private _toggleLegendOnVisibilityChange = false;

  constructor(private cdRef: ChangeDetectorRef) {}

  sortLayers(type: 'id'|'title') {
    if (type === 'id') {
    this.sortLayersByZindex();
    this.sortedAlpha = false;
    }
    if (type === 'title') {
    this.sortLayersByTitle();
    this.sortedAlpha = true;
    }
  }

  private sortLayersByZindex() {
    this.layers.sort((layer1, layer2) => layer2.zIndex - layer1.zIndex);
  }

  private sortLayersByTitle() {
    this.layers.sort(function(a, b) {
    if (a.title < b.title) {
    return -1;
    }
    if (a.title > b.title) {
    return 1;
    }
    return 0;
    });
    }
  toggleOnlyVisible() {
    this.onlyVisible = !this.onlyVisible;
  }
  toggleOnlyInRange() {
    this.onlyInRange = !this.onlyInRange;
  }

}

import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  TemplateRef,
  ContentChild
} from '@angular/core';
import { FloatLabelType } from '@angular/material';

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
  public disableReorderLayers = false;
  public thresholdToFilterAndSort = 5;

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

    this.defineReorderLayersStatus();
    return this._layers;
  }
  set layers(value: Layer[]) {
    this._layers = value;
    this.cdRef.detectChanges();
  }
  private _layers: Layer[] = [];

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
  }
  private _placeholder = '';

  @Input()
  get floatLabel() {
    return this._floatLabel;
  }
  set floatLabel(value: FloatLabelType) {
    this._floatLabel = value;
  }
  private _floatLabel: FloatLabelType = 'auto';


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

  getSortedOrFilteredLayers(): Layer[] {
    const localLayers = this.filterLayersList(this.layers);
    let alphaFilteredLayers;
    if (this.sortedAlpha) {
      alphaFilteredLayers = this.sortLayers(localLayers, 'title');
    } else {
      alphaFilteredLayers = this.sortLayers(localLayers, 'id');
    }
    return alphaFilteredLayers;
  }

  filterLayersList(localLayers: Layer[]): Layer[] {
    if (this.keyword || this.onlyInRange || this.onlyVisible) {
      const layerIDToKeep = [];
      localLayers.forEach(layer => {
        layerIDToKeep.push(layer.id);
      });

      localLayers.forEach(layer => {
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
      return localLayers
      .filter(layer =>
        layerIDToKeep.indexOf(layer.id) !== -1
      );

    } else {
      return this._layers;
    }

  }


  private sortLayers(layers: Layer[], type: 'id'|'title') {
    if (type === 'id') {
    return this.sortLayersByZindex(layers);
    }
    if (type === 'title') {
    return this.sortLayersByTitle(layers);
    }

  }

  private sortLayersByZindex(layers: Layer[]) {
    return layers.sort((layer1, layer2) => layer2.zIndex - layer1.zIndex);
  }

  private sortLayersByTitle(layers: Layer[]) {
    return layers.sort(function (a, b) {
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

  private defineReorderLayersStatus() {
    if (this.onlyInRange || this.onlyVisible || this.sortedAlpha || this.keyword) {
      this.disableReorderLayers = true;
    } else {
      this.disableReorderLayers = false;
    }
  }
}

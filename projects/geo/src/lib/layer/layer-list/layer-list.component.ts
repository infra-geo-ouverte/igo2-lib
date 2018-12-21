import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  TemplateRef,
  ContentChild,
  AfterViewInit
} from '@angular/core';
import { FloatLabelType } from '@angular/material';

import { Layer } from '../shared';
import { LayerListControlsEnum } from './layer-list.enum';
import { LayerListService } from './layer-list.service';

@Component({
  selector: 'igo-layer-list',
  templateUrl: './layer-list.component.html',
  styleUrls: ['./layer-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayerListComponent implements AfterViewInit {
  public hasLayerNotVisible = false;
  public hasLayerOutOfRange = false;
  public disableReorderLayers = false;
  public thresholdToFilterAndSort = 5;

  @ContentChild('igoLayerItemToolbar') templateLayerToolbar: TemplateRef<any>;

  @Input()
  get layers(): Layer[] {
    if (this.excludeBaseLayers) {
      if (this._layers.filter(f => f.visible === false && !f.baseLayer).length >= 1) {
        this.hasLayerNotVisible = true;
      } else {
        this.hasLayerNotVisible = false;
      }
      if (this._layers
        .filter(f => f.isInResolutionsRange === false && !f.baseLayer).length >= 1) {
        this.hasLayerOutOfRange = true;
      } else {
        this.hasLayerOutOfRange = false;
      }
    } else {
      if (this._layers.filter(f => f.visible === false).length >= 1) {
        this.hasLayerNotVisible = true;
      } else {
        this.hasLayerNotVisible = false;
      }
      if (this._layers.filter(f => f.isInResolutionsRange === false).length >= 1) {
        this.hasLayerOutOfRange = true;
      } else {
        this.hasLayerOutOfRange = false;
      }
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
  get layerFilterAndSortOptions() {
    return this._layerFilterAndSortOptions;
  }
  set layerFilterAndSortOptions(value: any) {
    this._layerFilterAndSortOptions = value;
  }
  private _layerFilterAndSortOptions = '';

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

  constructor(
    private cdRef: ChangeDetectorRef,
    public layerListService: LayerListService) {}

  ngAfterViewInit(): void {
    this.initLayerFilterAndSortOptions();
  }

  private initLayerFilterAndSortOptions() {
    if (this.layerFilterAndSortOptions.toolbarThreshold) {
      this.thresholdToFilterAndSort = this.layerFilterAndSortOptions.toolbarThreshold;
    }

    if (this.layerFilterAndSortOptions.keyword && !this.layerListService.keywordInitializated) {
      this.layerListService.keyword = this.layerFilterAndSortOptions.keyword;
      this.layerListService.keywordInitializated = true;
    }
    if (this.layerFilterAndSortOptions.sortedAlpha && !this.layerListService.sortedAlphaInitializated) {
      this.layerListService.sortedAlpha = this.layerFilterAndSortOptions.sortedAlpha;
      this.layerListService.sortedAlphaInitializated = true;
    }
    if (this.layerFilterAndSortOptions.onlyVisible && !this.layerListService.onlyVisibleInitializated &&
      this.hasLayerNotVisible) {
      this.layerListService.onlyVisible = this.layerFilterAndSortOptions.onlyVisible;
      this.layerListService.onlyVisibleInitializated = true;
    }
    if (this.layerFilterAndSortOptions.onlyInRange && !this.layerListService.onlyInRangeInitializated &&
      this.hasLayerOutOfRange) {
      this.layerListService.onlyInRange = this.layerFilterAndSortOptions.onlyInRange;
      this.layerListService.onlyInRangeInitializated = true;
    }
  }

  getSortedOrFilteredLayers(): Layer[] {
    const localLayers = this.filterLayersList(this.layers);
    let alphaFilteredLayers;
    if (this.layerListService.sortedAlpha) {
      alphaFilteredLayers = this.sortLayers(localLayers, 'title');
    } else {
      alphaFilteredLayers = this.sortLayers(localLayers, 'id');
    }
    return alphaFilteredLayers;
  }

  showFilterSortToolbar(): boolean {
    switch (this.layerFilterAndSortOptions.showToolbar) {
      case LayerListControlsEnum.always:
        return true;
      case LayerListControlsEnum.never:
        return false;
      default:
        if (this.layers.length >= this.thresholdToFilterAndSort ||
          this.layerListService.getKeyword() ||
          this.layerListService.onlyInRange || this.layerListService.onlyVisible) {
          return true;
        } else {
          this.layerListService.keyword = '';
          this.layerListService.sortedAlpha = false;
          this.layerListService.onlyVisible = false;
          this.layerListService.onlyInRange = false;
          return false;
        }
    }
  }

  filterLayersList(localLayers: Layer[]): Layer[] {
    if (this.layerFilterAndSortOptions.showToolbar === LayerListControlsEnum.never) {
      return localLayers;
    }
    if (this.layerListService.getKeyword() || this.layerListService.onlyInRange || this.layerListService.onlyVisible) {
      const layerIDToKeep = [];
      localLayers.forEach(layer => {
        layerIDToKeep.push(layer.id);
      });

      localLayers.forEach(layer => {
        const localLayerKeywords = [];
        if (layer.options && layer.options['metadata'] && layer.options['metadata'].keywordList ) {
          layer.options['metadata'].keywordList.forEach(kw => {
            localLayerKeywords.push(kw.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
          });
        }
        if (this.layerListService.getKeyword()) {
          const localKeyword = this.layerListService.getKeyword().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const localLayerTitle = layer.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (
            !new RegExp(localKeyword, 'gi').test(localLayerTitle) &&
            !(this.layerListService.getKeyword()
            .toLowerCase() === layer.dataSource.options.type.toString().toLowerCase()) &&
            localLayerKeywords.filter(kw => new RegExp(localKeyword, 'gi').test(kw)).length === 0) {
            const index = layerIDToKeep.indexOf(layer.id);
            if (index > -1) {
              layerIDToKeep.splice(index, 1);
            }
          }
        }
        if (this.layerListService.onlyVisible && layer.visible === false) {
          const index = layerIDToKeep.indexOf(layer.id);
            if (index > -1) {
              layerIDToKeep.splice(index, 1);
            }
        }
        if (this.layerListService.onlyInRange && layer.isInResolutionsRange === false) {
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
    this.layerListService.onlyVisible = !this.layerListService.onlyVisible;
  }
  toggleOnlyInRange() {
    this.layerListService.onlyInRange = !this.layerListService.onlyInRange;
  }

  private defineReorderLayersStatus() {
    if (this.layerListService.onlyInRange || this.layerListService.onlyVisible ||
      this.layerListService.sortedAlpha || this.layerListService.getKeyword()) {
      this.disableReorderLayers = true;
    } else {
      this.disableReorderLayers = false;
    }
  }
}

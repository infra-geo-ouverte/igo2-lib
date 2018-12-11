import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

import { MapDetailsToolOptions } from './map-details-tool.interface';
import { LayerListControlsEnum } from '@igo2/geo';

@Register({
  name: 'mapDetails',
  title: 'igo.tools.map',
  icon: 'map'
})
@Component({
  selector: 'igo-map-details-tool',
  templateUrl: './map-details-tool.component.html'
})
export class MapDetailsToolComponent {
  public options: MapDetailsToolOptions = {};

  get toggleLegendOnVisibilityChange(): boolean {
    return this.options.toggleLegendOnVisibilityChange === undefined
      ? false
      : this.options.toggleLegendOnVisibilityChange;
  }

  get excludeBaseLayers(): boolean {

    if (this.options && this.options.layerListControls) {
      return this.options.layerListControls.excludeBaseLayers === undefined
        ? false
        : this.options.layerListControls.excludeBaseLayers;
    } else {
      return false;
    }
  }

  get layerFilterAndSortOptions(): any {

    const filterSortOptions = {
      showToolbar: LayerListControlsEnum.default,
      toolbarThreshold: undefined,
      keyword: undefined,
      sortedAlpha: undefined,
      onlyVisible: undefined,
      onlyInRange: undefined,
    };

    if (this.options && this.options.layerListControls) {
      if (this.options.layerListControls.toolbarThreshold) {
        filterSortOptions.toolbarThreshold = this.options.layerListControls.toolbarThreshold;
      }
      if (this.options.layerListControls.keyword) {
        filterSortOptions.keyword = this.options.layerListControls.keyword;
      }
      if (this.options.layerListControls.sortedAlpha) {
        filterSortOptions.sortedAlpha = this.options.layerListControls.sortedAlpha;
      }
      if (this.options.layerListControls.onlyVisible) {
        filterSortOptions.onlyVisible = this.options.layerListControls.onlyVisible;
      }
      if (this.options.layerListControls.onlyInRange) {
        filterSortOptions.onlyInRange = this.options.layerListControls.onlyInRange;
      }
      switch (this.options.layerListControls.showToolbar) {
        case LayerListControlsEnum.always:
          filterSortOptions.showToolbar = LayerListControlsEnum.always,
          filterSortOptions.toolbarThreshold = undefined;
          break;
        case LayerListControlsEnum.never:
          filterSortOptions.showToolbar = LayerListControlsEnum.never,
          filterSortOptions.toolbarThreshold = undefined;
          break;
        default:
          break;
      }
    }
    return filterSortOptions;
  }

  get ogcFiltersInLayers(): boolean {
    return this.options.ogcFiltersInLayers === undefined
      ? true
      : this.options.ogcFiltersInLayers;
  }

  constructor() {}
}

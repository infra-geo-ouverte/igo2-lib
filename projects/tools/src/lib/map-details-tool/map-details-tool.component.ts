import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Register } from '@igo2/context';

import { MapDetailsToolOptions } from './map-details-tool.interface';

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
    return this.options.excludeBaseLayers === undefined
      ? false
      : this.options.excludeBaseLayers;
  }

  get ogcFilterInLayerItem(): boolean {
    return this.options.ogcFiltersInLayers === undefined
      ? true
      : this.options.ogcFiltersInLayers;
  }

  constructor() {}
}

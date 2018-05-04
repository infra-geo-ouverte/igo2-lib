import { Component } from '@angular/core';

import { Register } from '../../shared';

import { MapDetailsToolOptions } from './map-details-tool.interface';


@Register({
  name: 'mapDetails',
  title: 'igo.map',
  icon: 'map'
})
@Component({
  selector: 'igo-map-details-tool',
  templateUrl: './map-details-tool.component.html',
  styleUrls: ['./map-details-tool.component.styl']
})
export class MapDetailsToolComponent {

  public options: MapDetailsToolOptions = {};

  get toggleLegendOnVisibilityChange(): boolean {
    return this.options.toggleLegendOnVisibilityChange === undefined ?
      false : this.options.toggleLegendOnVisibilityChange;
  }

  get excludeBaseLayers(): boolean {
    return this.options.excludeBaseLayers === undefined ?
      false : this.options.excludeBaseLayers;
  }

  get ogcFilterInLayerItem(): boolean {
    return this.options.ogcFiltersInLayers === undefined ?
      true : this.options.ogcFiltersInLayers;
  }

  constructor() { }

}

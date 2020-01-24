import { MapState } from './../map.state';
import { Component, Input } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { LayerListControlsEnum, IgoMap } from '@igo2/geo';

import { LayerListControlsOptions } from '../shared/map-details-tool.interface';
import { MapDetailsState } from './map-details-tool.state';

@ToolComponent({
  name: 'mapDetails',
  title: 'igo.integration.tools.map',
  icon: 'map'
})
@Component({
  selector: 'igo-map-details-tool',
  templateUrl: './map-details-tool.component.html',
  styleUrls: ['./map-details-tool.component.scss']
})
export class MapDetailsToolComponent {
  @Input() toggleLegendOnVisibilityChange: boolean = false;

  @Input() expandLegendOfVisibleLayers: boolean = false;

  @Input() updateLegendOnResolutionChange: boolean = false;

  @Input() ogcButton: boolean = true;

  @Input() timeButton: boolean = true;

  @Input() layerListControls: LayerListControlsOptions = {};

  @Input() queryBadge: boolean = false;

  get map(): IgoMap {
    return this.mapState.map;
  }

  get layers(): boolean {
    for (const layer of this.map.layers) {
      if (layer.baseLayer !== true && layer.title !== 'searchPointerSummary') {
        return true;
      }
    }
    return false;
  }

  get excludeBaseLayers(): boolean {
    return this.layerListControls.excludeBaseLayers || false;
  }

  get layerFilterAndSortOptions(): any {
    const filterSortOptions = Object.assign({
      showToolbar: LayerListControlsEnum.default
    }, this.layerListControls);

    switch (this.layerListControls.showToolbar) {
      case LayerListControlsEnum.always:
        filterSortOptions.showToolbar = LayerListControlsEnum.always;
        filterSortOptions.toolbarThreshold = undefined;
        break;
      case LayerListControlsEnum.never:
        filterSortOptions.showToolbar = LayerListControlsEnum.never;
        filterSortOptions.toolbarThreshold = undefined;
        break;
      default:
        break;
    }
    return filterSortOptions;
  }

  constructor(private mapState: MapState, private mapDetailsState: MapDetailsState) {}

  searchEmit() {
    this.mapDetailsState.activateSearchTool();
  }

  catalogEmit() {
    this.mapDetailsState.activateCatalogTool();
  }

  contextEmit() {
    this.mapDetailsState.activateContextTool();
  }
}

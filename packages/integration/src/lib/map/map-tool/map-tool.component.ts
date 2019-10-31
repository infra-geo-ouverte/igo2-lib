import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { LayerListControlsEnum } from '@igo2/geo';

import { LayerListControlsOptions } from '../shared/map-details-tool.interface';
/**
 * Tool to browse a map's layers or to choose a different map
 */
@ToolComponent({
  name: 'map',
  title: 'igo.integration.tools.map',
  icon: 'map'
})
@Component({
  selector: 'igo-map-tool',
  templateUrl: './map-tool.component.html',
  styleUrls: ['./map-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapToolComponent {

  @Input() toggleLegendOnVisibilityChange: boolean = false;

  @Input() expandLegendOfVisibleLayers: boolean = false;

  @Input() updateLegendOnResolutionChange: boolean = false;

  @Input() ogcButton: boolean = true;

  @Input() timeButton: boolean = true;

  @Input() layerListControls: LayerListControlsOptions = {};

  @Input() queryBadge: boolean = false;

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

}

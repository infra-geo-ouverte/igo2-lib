import { Component, ChangeDetectionStrategy, Input, OnInit, ViewChild } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { LayerListControlsEnum, LayerListControlsOptions } from '@igo2/geo';

import { LayerListToolState } from '../layer-list-tool.state';
import { MatTabChangeEvent } from '@angular/material';
/**
 * Tool to browse a map's layers or to choose a different map
 */
@ToolComponent({
  name: 'mapTools',
  title: 'igo.integration.tools.map',
  icon: 'map'
})
@Component({
  selector: 'igo-map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapToolsComponent implements OnInit {

  @Input() toggleLegendOnVisibilityChange: boolean = false;

  @Input() expandLegendOfVisibleLayers: boolean = false;

  @Input() updateLegendOnResolutionChange: boolean = false;

  @Input() selectedTabAtOpening: string = 'legend';

  @Input() ogcButton: boolean = true;

  @Input() timeButton: boolean = true;

  @Input()
  set layerListControls(value: LayerListControlsOptions) {

    const stateKeyword = this.layerListToolState.keyword$.value;
    const stateOnlyVisible = this.layerListToolState.onlyVisible$.value;
    const stateSortAlpha = this.layerListToolState.sortAlpha$.value;

    value.keyword = stateKeyword !== '' ? stateKeyword : value.keyword;
    value.onlyVisible = stateOnlyVisible !== undefined ? stateOnlyVisible : value.onlyVisible;
    value.sortAlpha = stateSortAlpha !== undefined ? stateSortAlpha : value.sortAlpha;

    value.onlyVisible = value.onlyVisible === undefined ? false : value.onlyVisible;
    value.sortAlpha = value.sortAlpha === undefined ? false : value.sortAlpha;

    this._layerListControls = value;
  }

  get layerListControls(): LayerListControlsOptions {
    return this._layerListControls;
  }

  private _layerListControls = {};

  @Input() queryBadge: boolean = false;

  get excludeBaseLayers(): boolean {
    return this.layerListControls.excludeBaseLayers || false;
  }

  get layerFilterAndSortOptions(): LayerListControlsOptions {
    const filterSortOptions = Object.assign({
      showToolbar: LayerListControlsEnum.default
    }, this.layerListControls);

    switch (this.layerListControls.showToolbar) {
      case LayerListControlsEnum.always:
        filterSortOptions.showToolbar = LayerListControlsEnum.always;
        break;
      case LayerListControlsEnum.never:
        filterSortOptions.showToolbar = LayerListControlsEnum.never;
        break;
      default:
        break;
    }
    return filterSortOptions;
  }

  @ViewChild('tabGroup') tabGroup;

  constructor(
   public layerListToolState: LayerListToolState
  ) {}

  ngOnInit(): void {
    this.selectedTab();
  }

  private selectedTab() {
    const userSelectedTab = this.layerListToolState.selectedTab$.value;
    if (userSelectedTab) {
      this.layerListToolState.setSelectedTab(userSelectedTab);
    } else {
      if (this.selectedTabAtOpening === 'legend') {
        this.layerListToolState.setSelectedTab(1);
      }
      this.layerListToolState.setSelectedTab(0);
    }
  }

  public tabChanged(tab: MatTabChangeEvent) {
    this.layerListToolState.setSelectedTab(tab.index);
  }

  onLayerListChange(appliedFilters: LayerListControlsOptions ) {
    this.layerListToolState.setKeyword(appliedFilters.keyword);
    this.layerListToolState.setSortAlpha(appliedFilters.sortAlpha);
    this.layerListToolState.setOnlyVisible(appliedFilters.onlyVisible);
  }

}

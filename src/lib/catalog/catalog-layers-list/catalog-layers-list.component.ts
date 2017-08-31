import { Component, Input, Output, EventEmitter } from '@angular/core';

import { LayerCatalog, GroupLayers } from '../../layer';

@Component({
  selector: 'igo-catalog-layers-list',
  templateUrl: './catalog-layers-list.component.html',
  styleUrls: ['./catalog-layers-list.component.styl']
})
export class CatalogLayersListComponent {

  @Input()
  get groupsLayers(): GroupLayers[] { return this._groupsLayers; }
  set groupsLayers(value: GroupLayers[]) {
    this._groupsLayers = value;
  }
  private _groupsLayers: GroupLayers[];

  @Output() select = new EventEmitter<LayerCatalog>();
  @Output() unselect = new EventEmitter<LayerCatalog>();

  constructor() {}

}

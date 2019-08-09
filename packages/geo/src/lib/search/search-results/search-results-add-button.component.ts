import { Component, Input, Output, ChangeDetectionStrategy, EventEmitter, OnInit } from '@angular/core';

import { SearchResult, SearchResultItem } from '../shared/search.interfaces';
import { IgoMap } from '../../map/shared/map';
import { LayerOptions } from '../../layer/shared/layers/layer.interface';
import { LayerService } from '../../layer/shared/layer.service';
import { LAYER } from '../../layer/shared/layer.enums';
import { Feature } from '../../feature/shared/feature.interfaces';

@Component({
  selector: 'igo-search-add-button',
  templateUrl: './search-results-add-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultAddButtonComponent implements OnInit {

  @Input() layer: SearchResultItem;

  /**
   * Whether the layer is already added to the map
   */
  @Input() added: boolean;

  /**
   * The map to add the search result layer to
   */
  @Input() map: IgoMap;

  @Input()
  get color() {
    return this._color;
  }
  set color(value: string) {
    this._color = value;
  }
  private _color = 'primary';

  selectedFeature: Feature;

  constructor(private layerService: LayerService) {}

  /**
   * @internal
   */
  ngOnInit(): void {

    this.added = this.map.layers.findIndex((lay) => lay.title === this.layer.meta.title) !== -1;

  }

  /**
   * On toggle button click, emit the added change event
   * @internal
   */
  onToggleClick() {
    this.added ? this.remove() : this.add();
  }

  private add() {
    this.added = true;
    this.addLayerToMap();
  }

  private remove() {
    this.added = false;
    this.removeLayerFromMap();
  }

  /**
   * Emit added change event with added = true
   */
  private addLayerToMap() {
    if (this.map === undefined) {
      return;
    }

    if (this.layer.meta.dataType !== LAYER) {
      return undefined;
    }

    const layerOptions = (this.layer as SearchResult<LayerOptions>).data;
    this.layerService
      .createAsyncLayer(layerOptions)
      .subscribe(layer => this.map.addLayer(layer));

    const result = (this.layer as SearchResult);
    this.selectedFeature = (result as SearchResult<Feature>).data;
  }

  /**
   * Emit added change event with added = false
   */
  private removeLayerFromMap() {
    if (this.map === undefined) {
      return;
    }

    if (this.layer.meta.dataType !== LAYER) {
      return undefined;
    }

    const layerOptions = (this.layer as SearchResult<LayerOptions>).data;
    this.layerService.
       createAsyncLayer(layerOptions).
       subscribe(layer => this.map.addLayer(layer));

    const oLayer = this.map.getLayerById(this.layer.data.source.id);
    this.map.removeLayer(oLayer);
  }

}

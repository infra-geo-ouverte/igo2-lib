import { Component, Input, AfterViewInit, OnDestroy } from '@angular/core';

import { Layer } from '../../layer/shared';
import { LayerService } from '../../layer/shared/layer.service';
import { IgoMap } from '../shared';

@Component({
  selector: 'igo-mini-basemap',
  templateUrl: './mini-basemap.component.html',
  styleUrls: ['./mini-basemap.component.scss']
})
export class MiniBaseMapComponent implements AfterViewInit, OnDestroy {
  @Input()
  get map(): IgoMap {
    return this._map;
  }
  set map(value: IgoMap) {
    this._map = value;
    this.handleMoveEnd();
  }
  private _map: IgoMap;

  @Input()
  get baseLayer(): Layer {
    return this._baseLayer;
  }
  set baseLayer(value: Layer) {
    this._baseLayer = value;
    this.handleBaseLayerChanged(value);
  }
  private _baseLayer: Layer;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }
  private _disabled: boolean;

  @Input()
  get display(): boolean {
    return this._display;
  }
  set display(value: boolean) {
    this._display = value;
  }
  private _display: boolean;

  public basemap = new IgoMap({
    controls: {},
    interactions: false
  });

  constructor(private layerService: LayerService) {}

  ngAfterViewInit() {
    this.map.ol.on('moveend', () => this.handleMoveEnd());
    this.handleMoveEnd();
  }

  ngOnDestroy() {
    this.map.ol.un('moveend', () => this.handleMoveEnd());
  }

  changeBaseLayer(baseLayer: Layer) {
    if (this.disabled) {
      return;
    }
    this.map.changeBaseLayer(baseLayer);
  }

  private handleMoveEnd() {
    this.basemap.ol.setView(this.map.ol.getView());
  }

  private handleBaseLayerChanged(baselayer) {
    this.basemap.removeLayers();

    const options: any = Object.assign(
      Object.create(baselayer.options),
      baselayer.options
    );
    options.visible = true;

    const layer = this.layerService.createLayer(options);
    this.basemap.addLayer(layer);
  }
}

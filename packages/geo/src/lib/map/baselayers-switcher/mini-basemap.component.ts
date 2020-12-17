import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ApplicationRef
} from '@angular/core';

import { Layer, LayerOptions } from '../../layer/shared';
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

  @Input() title: string;

  constructor(
    private layerService: LayerService,
    private appRef: ApplicationRef
  ) {}

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
    this.appRef.tick();
  }

  private handleMoveEnd() {
    this.basemap.ol.setView(this.map.ol.getView());
  }

  private handleBaseLayerChanged(baselayer: Layer) {
    this.basemap.removeAllLayers();

    const options: any = Object.assign(
      Object.create(baselayer.options),
      baselayer.options,
      {
        visible: true,
        baseLayer: false
      }
    );

    const layer = this.layerService.createLayer(options);
    this.basemap.addLayer(layer);
    this.handleLinkedBaseLayer(layer);
  }

  private handleLinkedBaseLayer(baselayer: Layer) {
    const linkedLayers = baselayer.options.linkedLayers;
    if (!linkedLayers) {
      return;
    }
    const currentLinkedId = linkedLayers.linkId;
    const currentLinks = linkedLayers.links;
    const isParentLayer = currentLinks ? true : false;
    if (isParentLayer && currentLinkedId === baselayer.options.linkedLayers.linkId) {
      // search for child layers
      currentLinks.map(link => {
        link.linkedIds.map(linkedId => {
          const layerToApply = this.map.layers.find(l => l.options.linkedLayers?.linkId === linkedId);
          if (layerToApply) {
            const linkedLayerOptions: any = Object.assign(
              Object.create(layerToApply.options),
              layerToApply.options,
              {
                zIndex: 9000,
                visible: true,
                baseLayer: false,
              } as LayerOptions
            );
            this.basemap.addLayer(this.layerService.createLayer(linkedLayerOptions));
          }
        });
      });
    }
  }
}

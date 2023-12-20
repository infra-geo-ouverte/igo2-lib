import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy
} from '@angular/core';

import OlMap from 'ol/Map';
import OlView from 'ol/View';

import { Layer, LayerOptions } from '../../layer/shared';
import { LayerService } from '../../layer/shared/layer.service';
import { IgoMap } from '../shared/map';
import { MapBrowserComponent } from '../map-browser/map-browser.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'igo-mini-basemap',
    templateUrl: './mini-basemap.component.html',
    styleUrls: ['./mini-basemap.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, MapBrowserComponent]
})
export class MiniBaseMapComponent implements AfterViewInit, OnDestroy {
  @Input() map: IgoMap;
  @Input() disabled: boolean;
  @Input() title: string;

  @Input()
  get display(): boolean {
    return this._display;
  }
  set display(value: boolean) {
    this._display = value;
    this.basemap.ol.getView().changed();
  }
  private _display: boolean;

  @Input()
  get baseLayer(): Layer {
    return this._baseLayer;
  }
  set baseLayer(value: Layer) {
    this._baseLayer = value;
    this.handleBaseLayerChanged(value);
  }
  private _baseLayer: Layer;

  public basemap = new IgoMap({
    controls: {},
    interactions: false
  });

  constructor(
    private layerService: LayerService,
    private appRef: ApplicationRef
  ) {}

  ngAfterViewInit() {
    this.handleMainMapViewChange(this.map.ol.getView());
    this.map.viewController.olView.on('change', (change) => {
      this.handleMainMapViewChange(change.target as OlView);
    });
    this.map.ol.on('pointerdrag', (change) => {
      this.handleMainMapViewChange((change.target as OlMap).getView());
    });
  }

  ngOnDestroy() {
    this.map.viewController.olView.un('change', (change) => {
      this.handleMainMapViewChange(change.target as OlView);
    });
    this.map.ol.un('pointerdrag', (change) => {
      this.handleMainMapViewChange((change.target as OlMap).getView());
    });
  }

  changeBaseLayer(baseLayer: Layer) {
    if (this.disabled) {
      return;
    }
    this.map.changeBaseLayer(baseLayer);
    this.appRef.tick();
  }

  private handleMainMapViewChange(mainMapView) {
    const mainMapViewProperties = mainMapView.getProperties();
    this.basemap.viewController.olView.setResolution(
      mainMapViewProperties.resolution
    );
    this.basemap.viewController.olView.setRotation(
      mainMapViewProperties.rotation
    );
    this.basemap.viewController.olView.setCenter(
      this.map.viewController.getCenter()
    );
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
    if (
      isParentLayer &&
      currentLinkedId === baselayer.options.linkedLayers.linkId
    ) {
      // search for child layers
      currentLinks.map((link) => {
        link.linkedIds.map((linkedId) => {
          const layerToApply = this.map.layers.find(
            (l) => l.options.linkedLayers?.linkId === linkedId
          );
          if (layerToApply) {
            const linkedLayerOptions: any = Object.assign(
              Object.create(layerToApply.options),
              layerToApply.options,
              {
                zIndex: 9000,
                visible: true,
                baseLayer: false
              } as LayerOptions
            );
            this.basemap.addLayer(
              this.layerService.createLayer(linkedLayerOptions)
            );
          }
        });
      });
    }
  }
}

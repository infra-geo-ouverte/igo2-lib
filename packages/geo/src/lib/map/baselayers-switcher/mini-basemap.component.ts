import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ApplicationRef,
  ChangeDetectorRef
} from '@angular/core';

import OlMap from 'ol/Map';
import OlView from 'ol/View';

import {
  Layer,
  LayerOptions,
  LayersLink,
  LayersLinkProperties
} from '../../layer/shared';
import { LayerService } from '../../layer/shared/layer.service';
import { IgoMap } from '../shared/map';

@Component({
  selector: 'igo-mini-basemap',
  templateUrl: './mini-basemap.component.html',
  styleUrls: ['./mini-basemap.component.scss']
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
    this.cdRef.detectChanges();
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
    private appRef: ApplicationRef,
    private cdRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.handleMainMapViewChange(this.map.ol.getView());
    this.map.viewController.olView.on('change', change => {
      this.handleMainMapViewChange((change.target as OlView));
    });
    this.map.ol.on('pointerdrag', change => {
      this.handleMainMapViewChange((change.target as OlMap).getView());
    });
  }

  ngOnDestroy() {
    this.map.viewController.olView.un('change', change => {
      this.handleMainMapViewChange((change.target as OlView));
    });
    this.map.ol.un('pointerdrag', change => {
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
    this.basemap.viewController.olView.setResolution(mainMapViewProperties.resolution);
    this.basemap.viewController.olView.setRotation(mainMapViewProperties.rotation);
    this.basemap.viewController.olView.setCenter(this.map.viewController.getCenter());
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

  private handleLinkedBaseLayer(baselayer: Layer): void {
    const linkedLayers: LayersLink = baselayer.options.linkedLayers;
    if (!linkedLayers) {
      return;
    }
    const links: LayersLinkProperties[] = linkedLayers.links;
    const isParentLayer: boolean = links ? true : false;
    if (isParentLayer) {
      // search for child layers
      links.map((link: LayersLinkProperties) => {
        link.linkedIds.map((linkedId: string) => {
          const layerToApply: Layer = this.map.layers.find(
            (layer: Layer) => layer.options.linkedLayers?.linkId === linkedId
          );
          if (layerToApply) {
            const linkedLayerOptions: LayerOptions = Object.assign(
              Object.create(layerToApply.options),
              layerToApply.options,
              {
                zIndex: 9000,
                visible:
                  layerToApply.options.linkedLayers?.showInMiniBaseMap ?? true,
                baseLayer: false
              } as LayerOptions
            );
            this.basemap.addLayer(this.layerService.createLayer(linkedLayerOptions));
          }
        });
      });
    }
  }
}

import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

import { Media, MediaService } from '@igo2/core/media';
import {
  IgoMap,
  LayerService,
  MAP_DIRECTIVES,
  MapViewOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-simple-map',
  templateUrl: './simple-map.component.html',
  styleUrls: ['./simple-map.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, MAP_DIRECTIVES, NgIf]
})
export class AppSimpleMapComponent {
  public pointerCoord: [number, number];
  public pointerCoordDelay = 0;
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      },
      scaleLine: true
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 6,
    rotation: 0.75
  };

  get media(): Media {
    return this.mediaService.getMedia();
  }

  get isTouchScreen(): boolean {
    return this.mediaService.isTouchScreen();
  }

  constructor(
    private layerService: LayerService,
    private mediaService: MediaService
  ) {
    this.layerService
      .createAsyncLayer({
        title: 'OSM',
        sourceOptions: {
          type: 'osm'
        },
        visible: true,
        baseLayer: true
      })
      .subscribe((layer) => {
        this.map.layerController.add(layer);
      });
  }

  onPointerMove(event: [number, number]): void {
    this.pointerCoord = event;
  }
}

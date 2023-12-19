import { NgIf } from '@angular/common';
import { Component } from '@angular/core';

import { LanguageService, MediaService } from '@igo2/core';
import {
  DataSourceService,
  IgoMap,
  IgoMapModule,
  LayerService
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-simple-map',
  templateUrl: './simple-map.component.html',
  styleUrls: ['./simple-map.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, IgoMapModule, NgIf]
})
export class AppSimpleMapComponent {
  public pointerCoord;
  public pointerCoordDelay: number = 0;
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      },
      scaleLine: true
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 6,
    rotation: 0.75
  };

  get media() {
    return this.mediaService.getMedia();
  }

  get isTouchScreen() {
    return this.mediaService.isTouchScreen();
  }

  constructor(
    private languageService: LanguageService,
    private dataSourceService: DataSourceService,
    private layerService: LayerService,
    private mediaService: MediaService
  ) {
    this.dataSourceService
      .createAsyncDataSource({
        type: 'osm'
      })
      .subscribe((dataSource) => {
        this.map.addLayer(
          this.layerService.createLayer({
            title: 'OSM',
            source: dataSource
          })
        );
      });
  }

  onPointerMove(event) {
    this.pointerCoord = event;
  }
}

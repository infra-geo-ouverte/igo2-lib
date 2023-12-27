import { Component } from '@angular/core';

import { WorkspaceStore } from '@igo2/common';
import {
  IgoMap,
  LayerOptions,
  LayerService,
  MapViewOptions,
  TileLayer
} from '@igo2/geo';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class AppImportExportComponent {
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 9
  };

  public store: WorkspaceStore = new WorkspaceStore([]);

  constructor(private layerService: LayerService) {
    this.layerService
      .createAsyncLayer({
        title: 'OSM',
        baseLayer: true,
        visible: true,
        sourceOptions: {
          type: 'osm'
        }
      } satisfies LayerOptions)
      .subscribe((layer: TileLayer) => this.map.addLayer(layer));
  }
}

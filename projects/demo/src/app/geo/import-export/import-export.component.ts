import { Component } from '@angular/core';

import { WorkspaceStore } from '@igo2/common';
import { IgoMap, ImageLayer, LayerOptions, LayerService } from '@igo2/geo';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class AppImportExportComponent {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 9
  };

  public store = new WorkspaceStore([]);

  constructor(
    private layerService: LayerService
  ) {
    this.layerService
      .createAsyncLayer({
        title: 'OSM',
        baseLayer: true,
        visible: true,
        sourceOptions: {
          type: 'osm'
        }
      } as LayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));
  }
}

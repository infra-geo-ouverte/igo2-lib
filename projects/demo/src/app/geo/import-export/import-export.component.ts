import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { WorkspaceStore } from '@igo2/common/workspace';
import {
  IMPORT_EXPORT_DIRECTIVES,
  IgoMap,
  LayerOptions,
  LayerService,
  MAP_DIRECTIVES,
  MapViewOptions,
  TileLayer
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatGridListModule,
    MAP_DIRECTIVES,
    IMPORT_EXPORT_DIRECTIVES
  ]
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
      .subscribe((layer: TileLayer) => this.map.layerController.add(layer));
  }
}

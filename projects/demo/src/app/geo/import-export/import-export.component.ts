import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { WorkspaceStore } from '@igo2/common';
import { LanguageService } from '@igo2/core';
import {
  IgoImportExportModule,
  IgoMap,
  IgoMapModule,
  LayerService
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
    IgoMapModule,
    IgoImportExportModule
  ]
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
    private languageService: LanguageService,
    private layerService: LayerService
  ) {
    this.layerService
      .createAsyncLayer({
        title: 'OSM',
        sourceOptions: {
          type: 'osm'
        }
      })
      .subscribe((l) => this.map.addLayer(l));
  }
}

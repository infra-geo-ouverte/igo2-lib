import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { IgoPanelModule } from '@igo2/common';
import {
  ContextService,
  IgoContextImportExportModule,
  IgoContextManagerModule
} from '@igo2/context';
import {
  IgoLayerModule,
  IgoMap,
  IgoMapModule,
  IgoMetadataModule,
  MapService,
  MapViewOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatGridListModule,
    IgoMapModule,
    IgoContextManagerModule,
    IgoPanelModule,
    IgoLayerModule,
    IgoMetadataModule,
    IgoContextImportExportModule
  ]
})
export class AppContextComponent {
  public map: IgoMap = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 6
  };

  constructor(
    private mapService: MapService,
    private contextService: ContextService
  ) {
    this.mapService.setMap(this.map);
    this.contextService.loadDefaultContext();
    this.contextService.loadContexts();
  }
}

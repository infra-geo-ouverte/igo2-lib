import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { PanelComponent } from '@igo2/common/panel';
import {
  CONTEXT_MANAGER_DIRECTIVES,
  ContextImportExportComponent,
  ContextService
} from '@igo2/context';
import {
  IgoMap,
  LAYER_DIRECTIVES,
  MAP_DIRECTIVES,
  METADATA_DIRECTIVES,
  MapService,
  MapViewOptions
} from '@igo2/geo';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss'],
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    MatGridListModule,
    MAP_DIRECTIVES,
    CONTEXT_MANAGER_DIRECTIVES,
    PanelComponent,
    LAYER_DIRECTIVES,
    METADATA_DIRECTIVES,
    ContextImportExportComponent
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

import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { PanelComponent } from '@igo2/common';
import {
  ContextService,
  IgoContextImportExportModule,
  IgoContextManagerModule
} from '@igo2/context';
import { LanguageService } from '@igo2/core';
import {
  IgoLayerModule,
  IgoMap,
  IgoMapModule,
  IgoMetadataModule,
  MapService
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
    PanelComponent,
    IgoLayerModule,
    IgoMetadataModule,
    IgoContextImportExportModule
  ]
})
export class AppContextComponent {
  public map = new IgoMap({
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 6
  };

  constructor(
    private languageService: LanguageService,
    private mapService: MapService,
    private contextService: ContextService
  ) {
    this.mapService.setMap(this.map);
    this.contextService.loadDefaultContext();
    this.contextService.loadContexts();
  }
}

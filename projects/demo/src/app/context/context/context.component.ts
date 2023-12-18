import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { ContextService } from '@igo2/context';
import { LanguageService } from '@igo2/core';
import { IgoMap, MapService } from '@igo2/geo';

import { IgoPanelModule } from '../../../../../../packages/common/src/lib/panel/panel.module';
import { IgoContextImportExportModule } from '../../../../../../packages/context/src/lib/context-import-export/context-import-export.module';
import { IgoContextManagerModule } from '../../../../../../packages/context/src/lib/context-manager/context-manager.module';
import { IgoLayerModule } from '../../../../../../packages/geo/src/lib/layer/layer.module';
import { IgoMapModule } from '../../../../../../packages/geo/src/lib/map/map.module';
import { IgoMetadataModule } from '../../../../../../packages/geo/src/lib/metadata/metadata.module';
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

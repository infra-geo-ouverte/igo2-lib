import { Component } from '@angular/core';
import { ContextService } from '@igo2/context';

import { LanguageService } from '@igo2/core';
import { IgoMap, MapService } from '@igo2/geo';

@Component({
  selector: 'app-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss']
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
    private contextService: ContextService,
  ) {
    this.mapService.setMap(this.map);
    this.contextService.loadDefaultContext();
    this.contextService.loadContexts();
  }
}

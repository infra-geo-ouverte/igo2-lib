import { Component } from '@angular/core';

import { ContextService } from '@igo2/context';
import { IgoMap, MapService, MapViewOptions } from '@igo2/geo';

@Component({
  selector: 'app-context',
  templateUrl: './context.component.html',
  styleUrls: ['./context.component.scss']
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

import { Directive, Self, OnInit, OnDestroy } from '@angular/core';

import { MapService } from '../shared/map.service';
import { MapBrowserComponent } from './map-browser.component';

@Directive({
  selector: '[igoMapBrowserBinding]'
})
export class MapBrowserBindingDirective implements OnInit, OnDestroy {
  private component: MapBrowserComponent;

  constructor(
    @Self() component: MapBrowserComponent,
    private mapService: MapService
  ) {
    this.component = component;
  }

  ngOnInit() {
    if (this.mapService.getMap() !== undefined) {
      throw new Error('No more than one map be binded to the map service.');
    }

    this.mapService.setMap(this.component.map);
  }

  ngOnDestroy() {
    this.mapService.setMap(undefined);
  }
}

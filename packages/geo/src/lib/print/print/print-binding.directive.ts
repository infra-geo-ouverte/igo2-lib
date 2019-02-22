import { Directive, Self, OnInit } from '@angular/core';

import { MapService } from '../../map/shared/map.service';
import { PrintComponent } from './print.component';

@Directive({
  selector: '[igoPrintBinding]'
})
export class PrintBindingDirective implements OnInit {
  private component: PrintComponent;

  constructor(
    @Self() component: PrintComponent,
    private mapService: MapService
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.component.map = this.mapService.getMap();
  }
}

import { Directive, Self, OnInit } from '@angular/core';

import { MapService } from '../../map';
import { ShareMapComponent } from './share-map.component';


@Directive({
  selector: '[igoShareMapBinding]'
})
export class ShareMapBindingDirective implements OnInit {

  private component: ShareMapComponent;

  constructor(@Self() component: ShareMapComponent,
              private mapService: MapService) {
    this.component = component;
  }

  ngOnInit() {
    this.component.map = this.mapService.getMap();
  }

}

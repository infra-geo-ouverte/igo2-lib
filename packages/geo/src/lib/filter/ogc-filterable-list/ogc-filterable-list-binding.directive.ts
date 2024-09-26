import { Directive, OnDestroy, OnInit, Self } from '@angular/core';

import { Subscription } from 'rxjs';

import { MapService } from '../../map/shared/map.service';
import { OgcFilterableListComponent } from './ogc-filterable-list.component';

@Directive({
  selector: '[igoOgcFilterableListBinding]',
  standalone: true
})
export class OgcFilterableListBindingDirective implements OnInit, OnDestroy {
  private component: OgcFilterableListComponent;
  private layers$$: Subscription;

  constructor(
    @Self() component: OgcFilterableListComponent,
    private mapService: MapService
  ) {
    this.component = component;
  }

  ngOnInit() {
    // Override input layers
    this.component.layers = [];

    this.layers$$ = this.mapService
      .getMap()
      .layerController.layersFlattened$.subscribe((layers) => {
        this.component.layers = layers;
      });
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }
}

import { Directive, OnDestroy, OnInit, inject } from '@angular/core';

import { Subscription } from 'rxjs';

import { MapService } from '../../map/shared/map.service';
import { OgcFilterableListComponent } from './ogc-filterable-list.component';

@Directive({
  selector: '[igoOgcFilterableListBinding]',
  standalone: true
})
export class OgcFilterableListBindingDirective implements OnInit, OnDestroy {
  private mapService = inject(MapService);

  private component: OgcFilterableListComponent;
  private layers$$: Subscription;

  constructor() {
    const component = inject(OgcFilterableListComponent, { self: true });

    this.component = component;
  }

  ngOnInit() {
    // Override input layers
    this.component.setLayers([]);

    this.layers$$ = this.mapService
      .getMap()
      .layerController.layersFlattened$.subscribe((layers) => {
        this.component.setLayers(layers);
      });
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }
}

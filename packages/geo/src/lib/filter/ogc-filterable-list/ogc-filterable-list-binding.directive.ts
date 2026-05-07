import { DestroyRef, Directive, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MapService } from '../../map/shared/map.service';
import { OgcFilterableListComponent } from './ogc-filterable-list.component';

@Directive({
  selector: '[igoOgcFilterableListBinding]'
})
export class OgcFilterableListBindingDirective implements OnInit {
  private mapService = inject(MapService);
  private destroyRef = inject(DestroyRef);
  private component: OgcFilterableListComponent;

  constructor() {
    const component = inject(OgcFilterableListComponent, { self: true });

    this.component = component;
  }

  ngOnInit() {
    // Override input layers
    this.component.setLayers([]);

    this.mapService
      .getMap()
      ?.layerController.layersFlattened$.pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((layers) => {
        this.component.setLayers(layers);
      });
  }
}

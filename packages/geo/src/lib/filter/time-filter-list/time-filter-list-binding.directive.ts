import { DestroyRef, Directive, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MapService } from '../../map/shared/map.service';
import { TimeFilterListComponent } from './time-filter-list.component';

@Directive({
  selector: '[igoTimeFilterListBinding]'
})
export class TimeFilterListBindingDirective implements OnInit {
  private mapService = inject(MapService);
  private destroyRef = inject(DestroyRef);

  private component: TimeFilterListComponent;

  constructor() {
    const component = inject(TimeFilterListComponent, { self: true });

    this.component = component;
  }

  ngOnInit() {
    // Override input layers
    this.component.layers.set([]);

    this.mapService
      .getMap()
      ?.layerController.all$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((layers) => {
        this.component.layers.set(layers);
      });
  }
}

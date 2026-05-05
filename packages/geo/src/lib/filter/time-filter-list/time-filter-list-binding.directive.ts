import { Directive, OnDestroy, OnInit, inject } from '@angular/core';

import { Subscription } from 'rxjs';

import { MapService } from '../../map/shared/map.service';
import { TimeFilterListComponent } from './time-filter-list.component';

@Directive({
  selector: '[igoTimeFilterListBinding]',
  standalone: true
})
export class TimeFilterListBindingDirective implements OnInit, OnDestroy {
  private mapService = inject(MapService);

  private component: TimeFilterListComponent;
  private layers$$: Subscription;

  constructor() {
    const component = inject(TimeFilterListComponent, { self: true });

    this.component = component;
  }

  ngOnInit() {
    // Override input layers
    this.component.layers.set([]);

    this.layers$$ = this.mapService
      .getMap()
      .layerController.all$.subscribe((layers) => {
        this.component.layers.set(layers);
      });
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }
}

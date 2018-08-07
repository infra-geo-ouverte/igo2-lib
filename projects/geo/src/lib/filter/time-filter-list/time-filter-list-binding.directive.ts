import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { MapService } from '../../map/shared/map.service';
import { TimeFilterListComponent } from './time-filter-list.component';

@Directive({
  selector: '[igoTimeFilterListBinding]'
})
export class TimeFilterListBindingDirective implements OnInit, OnDestroy {
  private component: TimeFilterListComponent;
  private layers$$: Subscription;

  constructor(
    @Self() component: TimeFilterListComponent,
    private mapService: MapService
  ) {
    this.component = component;
  }

  ngOnInit() {
    // Override input layers
    this.component.layers = [];

    this.layers$$ = this.mapService.getMap().layers$.subscribe(layers => {
      this.component.layers = layers;
    });
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }
}

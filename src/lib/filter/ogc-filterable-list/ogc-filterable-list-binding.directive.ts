import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MapService } from '../../map';
import { OgcFilterableListComponent } from './ogc-filterable-list.component';


@Directive({
  selector: '[igoOgcFilterableListBinding]'
})
export class OgcFilterableListBindingDirective implements OnInit, OnDestroy {

  private component: OgcFilterableListComponent;
  private layers$$: Subscription;

  constructor(@Self() component: OgcFilterableListComponent,
              private mapService: MapService) {
    this.component = component;
  }

  ngOnInit() {
    // Override input layers
    this.component.datasources = [];

    this.layers$$ = this.mapService.getMap().layers$.subscribe(layers => {
      this.component.datasources = layers.map(layer => layer.dataSource);
    });
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

}

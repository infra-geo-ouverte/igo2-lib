import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MapService } from '../../map';
import { LayerListComponent } from './layer-list.component';


@Directive({
  selector: '[igoLayerListBinding]'
})
export class LayerListBindingDirective implements OnInit, OnDestroy {

  private component: LayerListComponent;
  private layers$$: Subscription;


  constructor(@Self() component: LayerListComponent,
              private mapService: MapService) {
    this.component = component;
  }

  ngOnInit() {
    // Override input layers
    this.component.layers = [];

    this.layers$$ = this.mapService.getMap().layers$
      .subscribe(layers => this.component.layers = layers);
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

}

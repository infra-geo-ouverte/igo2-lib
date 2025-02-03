import { Directive, OnDestroy, OnInit, Self } from '@angular/core';

import { Subscription, combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { MapService } from '../../map/shared/map.service';
import { AnyLayer } from '../shared/layers/any-layer';
import { Layer } from '../shared/layers/layer';
import { isLayerItem } from '../utils';
import { LayerLegendListComponent } from './layer-legend-list.component';

@Directive({
  selector: '[igoLayerLegendListBinding]',
  standalone: true
})
export class LayerLegendListBindingDirective implements OnInit, OnDestroy {
  private component: LayerLegendListComponent;
  private layersOrResolutionChange$$: Subscription;
  layersVisibility$$: Subscription;

  constructor(
    @Self() component: LayerLegendListComponent,
    private mapService: MapService
  ) {
    this.component = component;
  }

  ngOnInit() {
    // Override input layers
    this.component.layers = [];
    this.layersOrResolutionChange$$ = combineLatest([
      this.mapService.getMap().layerController.all$,
      this.mapService.getMap().viewController.resolution$
    ])
      .pipe(debounceTime(10))
      .subscribe((bunch: [AnyLayer[], number]) => {
        const shownLayers = bunch[0].filter((layer) => {
          return isLayerItem(layer) && layer.showInLayerList === true;
        }) as Layer[];
        this.component.layers = shownLayers;

        this.layersVisibility$$ = combineLatest(
          shownLayers.map((layer) => layer.visible$)
        ).subscribe(() => this.component.change$.next());
      });
  }

  ngOnDestroy() {
    this.layersOrResolutionChange$$.unsubscribe();
    if (this.layersVisibility$$ !== undefined) {
      this.layersVisibility$$.unsubscribe();
      this.layersVisibility$$ = undefined;
    }
  }
}

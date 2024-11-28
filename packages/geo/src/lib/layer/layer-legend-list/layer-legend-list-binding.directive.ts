import { Directive, OnDestroy, OnInit, Self } from '@angular/core';

import { Subscription, combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { MapService } from '../../map/shared/map.service';
import { Layer } from '../shared/layers/layer';
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
      this.mapService.getMap().layers$,
      this.mapService.getMap().viewController.resolution$
    ])
      .pipe(debounceTime(10))
      .subscribe((bunch: [Layer[], number]) => {
        const shownLayers = bunch[0].filter((layer: Layer) => {
          return layer.showInLayerList === true;
        });
        this.component.layers = shownLayers;

        this.layersVisibility$$ = combineLatest(
          shownLayers.map((layer: Layer) => layer.visible$)
        ).subscribe(() => {
          this.component.change$.next();
        });
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

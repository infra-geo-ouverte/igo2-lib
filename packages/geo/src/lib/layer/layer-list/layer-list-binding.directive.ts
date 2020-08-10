import { Directive, Self, OnInit, OnDestroy, Optional } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';

import { RouteService } from '@igo2/core';
import { MapService } from '../../map/shared/map.service';
import { LayerListComponent } from './layer-list.component';
import { Layer } from '../shared/layers/layer';
import { map, debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[igoLayerListBinding]'
})
export class LayerListBindingDirective implements OnInit, OnDestroy {
  private component: LayerListComponent;
  private layersOrResolutionChange$$: Subscription;
  layersVisibility$$: Subscription;

  constructor(
    @Self() component: LayerListComponent,
    private mapService: MapService,
    @Optional() private route: RouteService
  ) {
    this.component = component;
  }

  ngOnInit() {
    // Override input layers
    // this.component.layers = [];
    this.layersOrResolutionChange$$ = combineLatest([
      this.mapService.getMap().layers$,
      this.mapService.getMap().viewController.resolution$]
    ).pipe(
      debounceTime(10)
    ).subscribe((bunch: [Layer[], number]) => {
      const shownLayers = bunch[0].filter((layer: Layer) => {
        return layer.showInLayerList === true;
      });
      this.component.layers = shownLayers;
      this.setLayersVisibilityStatus(shownLayers, this.component.excludeBaseLayers);
    });
  }

  private setLayersVisibilityStatus(layers: Layer[], excludeBaseLayers: boolean) {
    if (this.layersVisibility$$ !== undefined) {
      this.layersVisibility$$.unsubscribe();
      this.layersVisibility$$ = undefined;
    }
    this.layersVisibility$$ = combineLatest(layers
      .filter(layer => layer.baseLayer !== excludeBaseLayers )
      .map((layer: Layer) => layer.visible$))
      .pipe(map((visibles: boolean[]) => visibles.every(Boolean)))
      .subscribe((allLayersAreVisible: boolean) =>
        this.component.layersAreAllVisible = allLayersAreVisible);
  }

  ngOnDestroy() {
    this.layersOrResolutionChange$$.unsubscribe();
    if (this.layersVisibility$$ !== undefined) {
      this.layersVisibility$$.unsubscribe();
      this.layersVisibility$$ = undefined;
    }
  }

}

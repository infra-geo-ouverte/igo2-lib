import { DestroyRef, Directive, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { combineLatest, merge, of } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs/operators';

import { MapService } from '../../map/shared/map.service';
import { Layer } from '../shared/layers/layer';
import { isLayerItem } from '../utils';
import { LayerLegendListComponent } from './layer-legend-list.component';

@Directive({
  selector: '[igoLayerLegendListBinding]',
  standalone: true
})
export class LayerLegendListBindingDirective implements OnInit {
  private readonly mapService = inject(MapService);
  private readonly component = inject(LayerLegendListComponent, { self: true });
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    const mapInstance = this.mapService.getMap();
    combineLatest([
      mapInstance.layerController.all$,
      mapInstance.viewController.resolution$
    ])
      .pipe(
        debounceTime(10),
        switchMap(([layers]) => {
          const shownLayers = layers.filter(
            (layer) => isLayerItem(layer) && layer.showInLayerList === true
          ) as Layer[];
          if (shownLayers.length === 0) {
            return of(shownLayers);
          }
          return merge(
            of(shownLayers),
            merge(...shownLayers.map((l) => l.displayed$)).pipe(
              map(() => [...shownLayers])
            )
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((shownLayers) => this.component.setLayers(shownLayers));
  }
}

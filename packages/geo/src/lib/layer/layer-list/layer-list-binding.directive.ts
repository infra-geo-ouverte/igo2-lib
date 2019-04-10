import { Directive, Self, OnInit, OnDestroy, AfterViewInit, Optional } from '@angular/core';
import { Subscription } from 'rxjs';

import { RouteService } from '@igo2/core';
import { MapService } from '../../map/shared/map.service';
import { LayerListComponent } from './layer-list.component';
import { LayerListService } from './layer-list.service';
import { Layer } from '../shared/layers/layer';

@Directive({
  selector: '[igoLayerListBinding]'
})
export class LayerListBindingDirective implements OnInit, AfterViewInit, OnDestroy {
  private component: LayerListComponent;
  private layers$$: Subscription;

  constructor(
    @Self() component: LayerListComponent,
    private mapService: MapService,
    private layerListService: LayerListService,
    @Optional() private route: RouteService
  ) {
    this.component = component;
  }

  ngOnInit() {
    // Override input layers
    this.component.layers = [];

    this.layers$$ = this.mapService
      .getMap()
      .layers$.subscribe((layers: Layer[]) => {
        this.component.layers = layers.filter((layer: Layer) => {
          return layer.options.showInLayerList !== false;
        });
      });
  }

  ngAfterViewInit(): void {
    this.initRoutes();
  }

  private initRoutes() {
    if (
      this.route &&
      (this.route.options.llcKKey || this.route.options.llcAKey ||
        this.route.options.llcVKey || this.route.options.llcVKey)) {
      this.route.queryParams.subscribe(params => {

        const keywordFromUrl = params[this.route.options.llcKKey as string];
        const sortedAplhaFromUrl = params[this.route.options.llcAKey as string];
        const onlyVisibleFromUrl = params[this.route.options.llcVKey as string];
        const onlyInRangeFromUrl = params[this.route.options.llcRKey as string];
        if (keywordFromUrl && !this.layerListService.keywordInitialized) {
          this.layerListService.keyword = keywordFromUrl;
          this.layerListService.keywordInitialized = true;
        }
        if (sortedAplhaFromUrl && !this.layerListService.sortedAlphaInitialized) {
          this.layerListService.sortedAlpha = sortedAplhaFromUrl === '1' ? true : false;
          this.layerListService.sortedAlphaInitialized = true;
        }
        if (onlyVisibleFromUrl &&
          !this.layerListService.onlyVisibleInitialized &&
          this.component.hasLayerNotVisible) {
          this.layerListService.onlyVisible = onlyVisibleFromUrl === '1' ? true : false;
          this.layerListService.onlyVisibleInitialized = true;
        }
        if (onlyInRangeFromUrl &&
          !this.layerListService.onlyInRangeInitialized &&
          this.component.hasLayerOutOfRange) {
          this.layerListService.onlyInRange = onlyInRangeFromUrl === '1' ? true : false;
          this.layerListService.onlyInRangeInitialized = true;
        }
      });
    }
  }

  ngOnDestroy() {
    this.layers$$.unsubscribe();
  }

}

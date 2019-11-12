import { Directive, Self, OnInit, OnDestroy, AfterViewInit, Optional } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';

import { RouteService } from '@igo2/core';
import { MapService } from '../../map/shared/map.service';
import { LayerListComponent } from './layer-list.component';
import { LayerListService } from './layer-list.service';
import { Layer } from '../shared/layers/layer';
import { map, debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[igoLayerListBinding]'
})
export class LayerListBindingDirective implements OnInit, AfterViewInit, OnDestroy {
  private component: LayerListComponent;
  private layersOrResolutionChange$$: Subscription;
  layersVisibility$$: Subscription;
  layersRange$$: Subscription;

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
      this.setLayersVisibilityRangeStatus(shownLayers, this.component.excludeBaseLayers);
    });
  }

  ngAfterViewInit(): void {
    this.initRoutes();
  }

  private setLayersVisibilityRangeStatus(layers: Layer[], excludeBaseLayers: boolean) {
    if (this.layersVisibility$$ !== undefined) {
      this.layersVisibility$$.unsubscribe();
      this.layersVisibility$$ = undefined;
    }
    if (this.layersRange$$ !== undefined) {
      this.layersRange$$.unsubscribe();
      this.layersRange$$ = undefined;
    }
    this.layersVisibility$$ = combineLatest(layers
      .filter(layer => layer.baseLayer !== excludeBaseLayers )
      .map((layer: Layer) => layer.visible$))
      .pipe(map((visibles: boolean[]) => visibles.every(Boolean)))
      .subscribe((allLayersAreVisible: boolean) =>
        this.component.layersAreAllVisible = allLayersAreVisible);

    this.layersRange$$ = combineLatest(layers.map((layer: Layer) => layer.isInResolutionsRange$))
      .pipe(map((inrange: boolean[]) => inrange.every(Boolean)))
      .subscribe((layersAreAllInRange: boolean) =>
      this.component.layersAreAllInRange = layersAreAllInRange);
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
          !this.component.layersAreAllVisible) {
          this.layerListService.onlyVisible = onlyVisibleFromUrl === '1' ? true : false;
          this.layerListService.onlyVisibleInitialized = true;
        }
        if (onlyInRangeFromUrl &&
          !this.layerListService.onlyInRangeInitialized &&
          !this.component.layersAreAllInRange) {
          this.layerListService.onlyInRange = onlyInRangeFromUrl === '1' ? true : false;
          this.layerListService.onlyInRangeInitialized = true;
        }
      });
    }
  }

  ngOnDestroy() {
    this.layersOrResolutionChange$$.unsubscribe();
    if (this.layersVisibility$$ !== undefined) {
      this.layersVisibility$$.unsubscribe();
      this.layersVisibility$$ = undefined;
    }
    if (this.layersRange$$ !== undefined) {
      this.layersRange$$.unsubscribe();
      this.layersRange$$ = undefined;
    }
  }

}

import { Directive, Self, OnInit, Optional } from '@angular/core';

import { MapService, LayerListService } from '@igo2/geo';
import { ShareMapComponent } from './share-map.component';
import { RouteService } from '@igo2/core';

@Directive({
  selector: '[igoShareMapBinding]'
})
export class ShareMapBindingDirective implements OnInit {
  private component: ShareMapComponent;

  constructor(
    @Self() component: ShareMapComponent,
    private mapService: MapService,
    private layerListService: LayerListService,
    @Optional() private route: RouteService
  ) {
    this.component = component;
  }

  ngOnInit() {
    this.component.map = this.mapService.getMap();
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
        if (keywordFromUrl && !this.layerListService.keywordInitializated) {
          this.layerListService.keyword = keywordFromUrl;
          this.layerListService.keywordInitializated = true;
        }
        if (sortedAplhaFromUrl && !this.layerListService.sortedAlphaInitializated) {
          this.layerListService.sortedAlpha = sortedAplhaFromUrl === '1' ? true : false;
          this.layerListService.sortedAlphaInitializated = true;
        }
        if (onlyVisibleFromUrl && !this.layerListService.onlyVisibleInitializated) {
          this.layerListService.onlyVisible = onlyVisibleFromUrl === '1' ? true : false;
          this.layerListService.onlyVisibleInitializated = true;
        }
        if (onlyInRangeFromUrl && !this.layerListService.onlyInRangeInitializated) {
          this.layerListService.onlyInRange = onlyInRangeFromUrl === '1' ? true : false;
          this.layerListService.onlyInRangeInitializated = true;
        }
        this.component.resetUrl();
      });
    }
  }
}

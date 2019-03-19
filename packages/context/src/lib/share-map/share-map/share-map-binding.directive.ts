import { Directive, Self, OnInit, Optional } from '@angular/core';

import { LayerListService } from '@igo2/geo';
import { ShareMapComponent } from './share-map.component';
import { RouteService } from '@igo2/core';

@Directive({
  selector: '[igoShareMapBinding]'
})
export class ShareMapBindingDirective implements OnInit {
  private component: ShareMapComponent;

  constructor(
    @Self() component: ShareMapComponent,
    private layerListService: LayerListService,
    @Optional() private route: RouteService
  ) {
    this.component = component;
  }

  ngOnInit() {
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
        if (onlyVisibleFromUrl && !this.layerListService.onlyVisibleInitialized) {
          this.layerListService.onlyVisible = onlyVisibleFromUrl === '1' ? true : false;
          this.layerListService.onlyVisibleInitialized = true;
        }
        if (onlyInRangeFromUrl && !this.layerListService.onlyInRangeInitialized) {
          this.layerListService.onlyInRange = onlyInRangeFromUrl === '1' ? true : false;
          this.layerListService.onlyInRangeInitialized = true;
        }
        if (!this.component.hasApi) {
          this.component.resetUrl();
        }
      });
    }
  }
}

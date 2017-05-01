import { Directive, Self, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IgoMap, MapBrowserComponent } from '../../map';
import { LayerService, LayerOptions } from '../../layer';

import { ContextService } from './context.service';
import { DetailedContext } from './context.interface';


@Directive({
  selector: '[igoLayerContext]'
})
export class LayerContextDirective implements OnInit, OnDestroy {

  private component: MapBrowserComponent;
  private context$$: Subscription;

  get map(): IgoMap {
    return this.component.map;
  }

  constructor(@Self() component: MapBrowserComponent,
              private contextService: ContextService,
              private layerService: LayerService) {
    this.component = component;
  }

  ngOnInit() {
    this.context$$ = this.contextService.context$
      .filter(context => context !== undefined)
      .subscribe(context => this.handleContextChange(context));
  }

  ngOnDestroy() {
    this.context$$.unsubscribe();
  }

  private handleContextChange(context: DetailedContext) {
    if (context.layers === undefined) { return; }

    this.map.removeLayers();

    const layerOptions: LayerOptions[] = context.layers;
    layerOptions.forEach((options: LayerOptions, index: number) => {
      this.layerService.createAsyncLayer(Object.assign({
        zIndex: index + 1
      }, options)).subscribe(layer => this.map.addLayer(layer));
    });
  }

}

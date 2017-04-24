import { Directive, Self, Output, EventEmitter,
         OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MapBrowserComponent } from '../../map';
import { Layer } from '../../layer';
import { Feature } from '../../feature';

import { QueryService } from '../shared/query.service';

@Directive({
  selector: '[igoQuery]'
})
export class QueryDirective implements AfterViewInit, OnDestroy {

  private component: MapBrowserComponent;
  private queryLayers: Layer[];
  private queryLayers$$: Subscription;

  @Output() query = new EventEmitter<Feature>();

  constructor(@Self() component: MapBrowserComponent,
              private queryService: QueryService) {
    this.component = component;
  }

  ngAfterViewInit() {
    this.queryLayers$$ = this.component.map.layers$
      .subscribe((layers: Layer[]) => this.handleLayersChange(layers));

    this.component.map.olMap.on('singleclick', this.handleMapClick, this);
  }

  ngOnDestroy() {
    this.queryLayers$$.unsubscribe();
  }

  private handleLayersChange(layers: Layer[]) {
    this.queryLayers = layers.filter(layer => layer.isQueryable());
  }

  private handleMapClick(event: ol.MapBrowserEvent) {
    this.queryService.query(this.queryLayers, event.coordinate);
  }
}

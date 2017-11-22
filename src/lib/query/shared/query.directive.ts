import { Directive, Self, Output, EventEmitter,
         OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IgoMap } from '../../map/shared';
import { MapBrowserComponent } from '../../map/map-browser';
import { Layer } from '../../layer';
import { Feature } from '../../feature';

import { QueryService } from '../shared/query.service';


@Directive({
  selector: '[igoQuery]'
})
export class QueryDirective implements AfterViewInit, OnDestroy {

  private queryLayers: Layer[];
  private queryLayers$$: Subscription;

  get map(): IgoMap {
    return this.component.map;
  }

  @Output() query = new EventEmitter<Feature>();

  constructor(@Self() private component: MapBrowserComponent,
              private queryService: QueryService) {}

  ngAfterViewInit() {
    this.queryLayers$$ = this.component.map.layers$
      .subscribe((layers: Layer[]) => this.handleLayersChange(layers));

    this.map.ol.on('singleclick', this.handleMapClick, this);
  }

  ngOnDestroy() {
    this.queryLayers$$.unsubscribe();
    this.map.ol.un('singleclick', this.handleMapClick, this);
  }

  private handleLayersChange(layers: Layer[]) {
    const queryLayers = [];
    layers.forEach(layer => {
      if (layer.dataSource.isQueryable()) {
        queryLayers.push(layer);
      }
    });

    this.queryLayers = queryLayers;
  }

  private handleMapClick(event: ol.MapBrowserEvent) {
    const view = this.map.ol.getView();
    this.queryService.query(this.queryLayers, {
      coordinates: event.coordinate,
      projection: this.map.projection,
      resolution: view.getResolution()
    });
  }
}

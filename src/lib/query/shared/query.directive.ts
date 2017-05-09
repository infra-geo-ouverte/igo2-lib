import { Directive, Self, Output, EventEmitter,
         OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { IgoMap, MapBrowserComponent } from '../../map';
import { DataSource } from '../../datasource';
import { Layer } from '../../layer';
import { Feature } from '../../feature';

import { QueryService } from '../shared/query.service';


@Directive({
  selector: '[igoQuery]'
})
export class QueryDirective implements AfterViewInit, OnDestroy {

  private queryDataSources: DataSource[];
  private queryDataSources$$: Subscription;

  get map(): IgoMap {
    return this.component.map;
  }

  @Output() query = new EventEmitter<Feature>();

  constructor(@Self() private component: MapBrowserComponent,
              private queryService: QueryService) {}

  ngAfterViewInit() {
    this.queryDataSources$$ = this.component.map.layers$
      .subscribe((layers: Layer[]) => this.handleLayersChange(layers));

    this.map.ol.on('singleclick', this.handleMapClick, this);
  }

  ngOnDestroy() {
    this.queryDataSources$$.unsubscribe();
    this.map.ol.un('singleclick', this.handleMapClick, this);
  }

  private handleLayersChange(layers: Layer[]) {
    const dataSources = [];
    layers.forEach(layer => {
      const dataSource = layer.dataSource;
      if (dataSource.isQueryable()) {
        dataSources.push(dataSource);
      }
    });

    this.queryDataSources = dataSources;
  }

  private handleMapClick(event: ol.MapBrowserEvent) {
    const view = this.map.ol.getView();
    this.queryService.query(this.queryDataSources, {
      coordinates: event.coordinate,
      projection: this.map.projection,
      resolution: view.getResolution()
    });
  }
}

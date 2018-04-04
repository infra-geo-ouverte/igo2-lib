import { Directive, Self, Input, Output, EventEmitter,
         OnDestroy, AfterViewInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';

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
  private queries$$: Subscription[] = [];

  get map(): IgoMap {
    return this.component.map;
  }

  @Input()
  get waitForAllQueries(): boolean { return this._waitForAllQueries; }
  set waitForAllQueries(value: boolean) {
    this._waitForAllQueries = value;
  }
  private _waitForAllQueries: boolean = false;

  @Output() query = new EventEmitter<{
    features: Feature[] | Feature[][],
    event: ol.MapBrowserEvent
  }>();

  constructor(@Self() private component: MapBrowserComponent,
              private queryService: QueryService) {}

  ngAfterViewInit() {
    this.queryLayers$$ = this.component.map.layers$
      .subscribe((layers: Layer[]) => this.handleLayersChange(layers));

    this.map.ol.on('singleclick', this.handleMapClick, this);
  }

  ngOnDestroy() {
    this.queryLayers$$.unsubscribe();
    this.unsubscribeQueries();
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
    this.unsubscribeQueries();

    const view = this.map.ol.getView();
    const queries$ = this.queryService.query(this.queryLayers, {
      coordinates: event.coordinate,
      projection: this.map.projection,
      resolution: view.getResolution()
    });

    if (this.waitForAllQueries) {
      this.queries$$.push(
        forkJoin(...queries$).subscribe(
          (features: Feature[][]) => this.query.emit({features: features, event: event})
        )
      );
    } else {
      this.queries$$ = queries$.map((query$: Observable<Feature[]>) => {
        return query$.subscribe(
          (features: Feature[]) => this.query.emit({features: features, event: event})
        );
      });
    }
  }

  private unsubscribeQueries() {
    this.queries$$.forEach((sub: Subscription) => sub.unsubscribe());
    this.queries$$ = [];
  }
}

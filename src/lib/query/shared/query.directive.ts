import { Directive, Self, Input, Output, EventEmitter,
         OnDestroy, AfterViewInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';

import { IgoMap } from '../../map/shared';
import { MapBrowserComponent } from '../../map/map-browser';
import { Layer } from '../../layer';
import { Feature } from '../../feature';
import * as ol from 'openlayers';
import { QueryService } from '../shared/query.service';
import { LanguageService } from '../../core';

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
              private queryService: QueryService,
              private languageService: LanguageService) {}

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

    const clickedFeatures: ol.Feature[] = []
    const format = new ol.format.GeoJSON();
    const mapProjection = this.map.projection;
    this.map.ol.forEachFeatureAtPixel(event.pixel,
       function(feature: ol.Feature, layer: ol.layer.Layer) {
         if (layer.getZIndex() !== 999) {
           let title;
           if (layer.get('title') !== undefined) {
             title = layer.get('title')
            } else {
              title = this.map.layers.filter((f) => f['zIndex'] === layer.getZIndex())[0]
              .dataSource['options']['title']
            }
          feature.set('clickedTitle', title)
          clickedFeatures.push(feature)
         }
       }.bind(this));
       const featuresGeoJSON = JSON.parse(
         format.writeFeatures(clickedFeatures, {
           dataProjection: 'EPSG:4326',
           featureProjection: mapProjection
          })
        );
  let i = 0;
  let parsedClickedFeatures: Feature[] = [];
  parsedClickedFeatures = featuresGeoJSON.features.map(f =>
    Object.assign({}, f, {
      source: this.languageService.translate.instant('igo.clickOnMap.clickedFeature'),
      id: f.properties.clickedTitle + ' ' + String(i++),
      icon: 'mouse',
      title: f.properties.clickedTitle
    })
  );
  parsedClickedFeatures.forEach(element => {
    delete element.properties['clickedTitle'];
  });
    const view = this.map.ol.getView();
    const queries$ = this.queryService.query(this.queryLayers, {
      coordinates: event.coordinate,
      projection: this.map.projection,
      resolution: view.getResolution()
    });
    if (queries$.length === 0) {
      this.query.emit({features: parsedClickedFeatures, event: event})
    } else {
      if (this.waitForAllQueries) {
        this.queries$$.push(
          forkJoin(...queries$).subscribe(
            (features: Feature[][]) =>
            this.query.emit({
              features: features.filter((f) => f.length > 0).concat(parsedClickedFeatures),
              event: event
            })
          )
        );
      } else {
        this.queries$$ = queries$.map((query$: Observable<Feature[]>) => {
          return query$.subscribe(
            (features: Feature[]) => this.query.emit({
              features: parsedClickedFeatures.concat(features),
              event: event
            })
          );
        });
      }
    }
  }

  private unsubscribeQueries() {
    this.queries$$.forEach((sub: Subscription) => sub.unsubscribe());
    this.queries$$ = [];
  }
}

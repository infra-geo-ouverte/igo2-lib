import {
  Directive,
  Self,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit
} from '@angular/core';

import { Subscription, Observable, forkJoin } from 'rxjs';

import MapBrowserEvent from 'ol/MapBrowserEvent';
import DragBox from 'ol/interaction/DragBox';
import { MAC } from 'ol/has';
import GeoJSON from 'ol/format/GeoJSON';
import FeatureOL from 'ol/Feature';
import LayerOL from 'ol/layer/Layer';

import { LanguageService } from '@igo2/core';
import { IgoMap } from '../../map/shared/map';
import { MapBrowserComponent } from '../../map/map-browser/map-browser.component';
import { Layer } from '../../layer/shared/layers/layer';
import { Feature } from '../../feature/shared/feature.interface';
import { SourceFeatureType } from '../../feature/shared/feature.enum';

import { QueryableDataSource } from './query.interface';
import { QueryService } from './query.service';

@Directive({
  selector: '[igoQuery]'
})
export class QueryDirective implements AfterViewInit, OnDestroy {
  private queryLayers: Layer[];
  private queryLayers$$: Subscription;
  private queries$$: Subscription[] = [];

  public dragBox = new DragBox({
    condition: this.platformModifierKeyOnly
  });

  get map(): IgoMap {
    return this.component.map;
  }

  @Input()
  get waitForAllQueries(): boolean {
    return this._waitForAllQueries;
  }
  set waitForAllQueries(value: boolean) {
    this._waitForAllQueries = value;
  }
  private _waitForAllQueries = false;

  @Output()
  query = new EventEmitter<{
    features: Feature[] | Feature[][];
    event: MapBrowserEvent;
  }>();

  constructor(
    @Self() private component: MapBrowserComponent,
    private queryService: QueryService,
    private languageService: LanguageService
  ) {}

  ngAfterViewInit() {
    this.queryLayers$$ = this.component.map.layers$.subscribe(
      (layers: Layer[]) => this.handleLayersChange(layers)
    );

    this.map.ol.on('singleclick', this.handleMapClick, this);
    this.dragBox = new DragBox({
      condition: this.platformModifierKeyOnly
    });
    this.map.ol.addInteraction(this.dragBox);
    this.dragBox.on('boxend', this.handleMapClick, this);
  }

  ngOnDestroy() {
    this.queryLayers$$.unsubscribe();
    this.unsubscribeQueries();
    this.map.ol.un('singleclick', this.handleMapClick, this);
  }

  private handleLayersChange(layers: Layer[]) {
    const queryLayers = [];
    layers.forEach(layer => {
      if (this.isQueryable(layer.dataSource as QueryableDataSource)) {
        queryLayers.push(layer);
      }
    });

    this.queryLayers = queryLayers;
  }

  private manageFeatureByClick(
    featureOL: FeatureOL,
    layerOL: LayerOL
  ): Feature {
    if (layerOL.getZIndex() !== 999) {
      let title;
      if (layerOL.get('title') !== undefined) {
        title = layerOL.get('title');
      } else {
        title = this.map.layers.filter(
          f => f['zIndex'] === layerOL.getZIndex()
        )[0].dataSource['options']['title'];
      }
      let displayFieldValue = '';
      if (
        layerOL.get('displayField') &&
        featureOL.getProperties().hasOwnProperty(layerOL.get('displayField'))
      ) {
        displayFieldValue =
          ' (' + featureOL.getProperties()[layerOL.get('displayField')] + ')';
      }
      featureOL.set('clickedTitle', title + displayFieldValue);
      return featureOL;
    }
  }

  private handleMapClick(event: MapBrowserEvent) {
    this.unsubscribeQueries();
    const clickedFeatures: FeatureOL[] = [];
    const format = new GeoJSON();
    const mapProjection = this.map.projection;
    if (event.type === 'singleclick') {
      this.map.ol.forEachFeatureAtPixel(
        event.pixel,
        (featureOL: FeatureOL, layerOL: LayerOL) => {
          clickedFeatures.push(this.manageFeatureByClick(featureOL, layerOL));
        },
        { hitTolerance: 5 }
      );
    } else if (event.type === 'boxend') {
      const dragExtent = this.dragBox.getGeometry().getExtent();
      this.map.layers.forEach(layer => {
        if (
          layer.ol['type'] === 'VECTOR' &&
          layer.visible &&
          layer.zIndex !== 999
        ) {
          const featuresOL = layer.dataSource.ol as any;
          featuresOL.forEachFeatureIntersectingExtent(dragExtent, feature => {
            clickedFeatures.push(this.manageFeatureByClick(feature, layer.ol));
          });
        }
      });
    }
    const featuresGeoJSON = JSON.parse(
      format.writeFeatures(clickedFeatures.filter(f => f !== undefined), {
        dataProjection: 'EPSG:4326',
        featureProjection: mapProjection
      })
    );
    let i = 0;
    let parsedClickedFeatures: Feature[] = [];
    parsedClickedFeatures = featuresGeoJSON.features.map(f =>
      Object.assign({}, f, {
        sourceType: SourceFeatureType.Click,
        source: this.languageService.translate.instant(
          'igo.geo.clickOnMap.clickedFeature'
        ),
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
      this.query.emit({ features: parsedClickedFeatures, event: event });
    } else {
      if (this.waitForAllQueries) {
        this.queries$$.push(
          forkJoin(...queries$).subscribe((features: Feature[][]) =>
            this.query.emit({
              features: features
                .filter(f => f.length > 0)
                .concat(parsedClickedFeatures),
              event: event
            })
          )
        );
      } else {
        this.queries$$ = queries$.map((query$: Observable<Feature[]>) => {
          return query$.subscribe((features: Feature[]) =>
            this.query.emit({
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

  private isQueryable(dataSource: QueryableDataSource) {
    return dataSource.options.queryable;
  }

  private platformModifierKeyOnly(mapBrowserEvent) {
    const originalEvent = mapBrowserEvent.originalEvent;
    return (
      !originalEvent.altKey &&
      (MAC ? originalEvent.metaKey : originalEvent.ctrlKey) &&
      !originalEvent.shiftKey
    );
  }
}

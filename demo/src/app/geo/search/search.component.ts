import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as proj from 'ol/proj';

import { LanguageService } from '@igo2/core';
import { EntityStore, ActionStore } from '@igo2/common';
import {
  FEATURE,
  Feature,
  FeatureMotion,
  IgoMap,
  LayerService,
  MapService,
  Layer,
  LAYER,
  LayerOptions,
  Research,
  SearchResult,
  SearchService
} from '@igo2/geo';

import { SearchState } from '@igo2/integration';
import { GoogleLinks} from '../../../../../packages/geo/src/lib/utils/googleLinks';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class AppSearchComponent implements OnInit, OnDestroy {

  public store = new ActionStore([]);

  public map = new IgoMap({
    overlay: true,
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view = {
    center: [-73, 47.2],
    zoom: 7
  };

  public osmLayer: Layer;

  @ViewChild('mapBrowser', {read: ElementRef}) mapBrowser: ElementRef;

  public lonlat;
  public mapProjection: string;

  get searchStore(): EntityStore<SearchResult> {
    return this.searchState.store;
  }

  selectedFeature: Feature;

  constructor(
    private languageService: LanguageService,
    private mapService: MapService,
    private layerService: LayerService,
    private searchState: SearchState,
    private searchService: SearchService
  ) {
    this.mapService.setMap(this.map);

    this.layerService
      .createAsyncLayer({
        title: 'OSM',
        sourceOptions: {
          type: 'osm'
        }
      })
      .subscribe(layer => {
        this.osmLayer = layer;
        this.map.addLayer(layer);
      });
  }

  onSearchTermChange(term?: string) {
    if (term === undefined || term === '') {
      this.searchStore.clear();
      this.selectedFeature = undefined;
    }
  }

  onSearch(event: { research: Research; results: SearchResult[] }) {
    const results = event.results;
    this.searchStore.state.updateAll({focused: false, selected: false});
    const newResults = this.searchStore.entities$.value
      .filter((result: SearchResult) => result.source !== event.research.source)
      .concat(results);
    this.searchStore.load(newResults);
  }

  /**
   * Try to add a feature to the map when it's being focused
   * @internal
   * @param result A search result that could be a feature
   */
  onResultFocus(result: SearchResult) {
    this.tryAddFeatureToMap(result);
  }

  /**
   * Try to add a feature or a layer to the map when it's being selected
   * @internal
   * @param result A search result that could be a feature or some layer options
   */
  onResultSelect(result: SearchResult) {
    this.tryAddFeatureToMap(result);
    this.tryAddLayerToMap(result);
  }

  /**
   * Try to add a feature to the map overlay
   * @param result A search result that could be a feature
   */
  private tryAddFeatureToMap(result: SearchResult) {
    if (result.meta.dataType !== FEATURE) {
      return undefined;
    }
    this.selectedFeature = (result as SearchResult<Feature>).data;

    // Somethimes features have no geometry. It happens with some GetFeatureInfo
    if (this.selectedFeature.geometry === undefined) {
      return;
    }

    this.map.overlay.setFeatures([this.selectedFeature], FeatureMotion.Default);
  }

  /**
   * Try to add a layer to the map
   * @param result A search result that could be some layer options
   */
  private tryAddLayerToMap(result: SearchResult) {
    if (this.map === undefined) {
      return;
    }

    if (result.meta.dataType !== LAYER) {
      return undefined;
    }
    const layerOptions = (result as SearchResult<LayerOptions>).data;
    this.layerService
      .createAsyncLayer(layerOptions)
      .subscribe(layer => this.map.addLayer(layer));
  }

  ngOnInit() {

    this.store.load([
      {
        id: 'coordinates',
        title: 'coordinates',
        handler: this.onSearchCoordinate.bind(this),
      },
      {
        id: 'googleMaps',
        title: 'googleMap',
        handler: this.onOpenGoogleMaps.bind(this),
        args: ['1']
      },
      {
        id: 'googleStreetView',
        title: 'googleStreetView',
        handler: this.onOpenGoogleStreetView.bind(this)
      }
    ]);
  }

  ngOnDestroy() {
    this.store.destroy();
  }

  onContextMenuOpen(event: { x: number, y: number }) {
    const position = this.mapPosition(event);
    const coord = this.mapService.getMap().ol.getCoordinateFromPixel(position);
    this.mapProjection = this.mapService.getMap().projection;
    this.lonlat = proj.transform(coord, this.mapProjection, 'EPSG:4326');
  }

  mapPosition(event: { x: number, y: number }) {
    const contextmenuPoint = event;
    contextmenuPoint.y = contextmenuPoint.y - this.mapBrowser.nativeElement.getBoundingClientRect().top + window.scrollY;
    contextmenuPoint.x = contextmenuPoint.x - this.mapBrowser.nativeElement.getBoundingClientRect().left + window.scrollX;
    const position = [contextmenuPoint.x, contextmenuPoint.y];
    return position;
  }

  onSearchCoordinate() {
    this.searchStore.clear();
    const results = this.searchService.reverseSearch(this.lonlat);

    for (const i in results) {
      if (results.length > 0) {
        results[i].request.subscribe((_results: SearchResult<Feature>[]) => {
          this.onSearch({research: results[i], results: _results});
          /*if (_results[i].source.options.title === 'Coordinates') {
            this.onResultSelect(_results[0]);
          }*/
          console.log(_results[0]);
        });
      }
    }
  }

  onOpenGoogleMaps() {
    window.open(GoogleLinks.getGoogleMapsLink(this.lonlat[0], this.lonlat[1]));
  }

  onOpenGoogleStreetView() {
    window.open(GoogleLinks.getGoogleStreetViewLink(this.lonlat[0], this.lonlat[1]));
  }
}

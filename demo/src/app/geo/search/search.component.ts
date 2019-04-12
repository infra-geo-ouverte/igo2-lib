import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {LanguageService} from '@igo2/core';
import {EntityStore} from '@igo2/common';
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
  SearchResult
} from '@igo2/geo';

import {SearchState} from '@igo2/integration';
import {ActionStore} from '../../../../../packages/common/src/lib/action/shared';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class AppSearchComponent implements OnInit, OnDestroy, AfterViewInit  {

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
  public contextmenuPoint: {x: number, y: number};
  public mapPoint: {x: number, y: number};

  get searchStore(): EntityStore<SearchResult> {
    return this.searchState.store;
  }

  selectedFeature: Feature;
  constructor(
    private languageService: LanguageService,
    private mapService: MapService,
    private layerService: LayerService,
    private searchState: SearchState
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

  onSearch(event: {research: Research; results: SearchResult[]}) {
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
        id: 'add',
        title: 'coordinates',
        icon: 'add',
        handler: this.onSearchCoordinate.bind(this),
      },
      {
        id: 'edit',
        title: 'googleMap',
        icon: 'edit',
        handler: this.onSearchCoordinate.bind(this),
        args: ['1']
      },
      {
        id: 'delete',
        title: 'googleStreetView',
        icon: 'delete',
        handler: this.onSearchCoordinate.bind(this)
      }
    ]);
  }

  ngAfterViewInit() {
    console.log(this.mapBrowser);
  }

  ngOnDestroy() {
    this.store.destroy();
  }

  onContextMenuOpen(event: {x: number, y: number}) {
    this.contextmenuPoint = event;
    console.log(this.contextmenuPoint);
    console.log(this.mapBrowser.nativeElement.getBoundingClientRect().top + window.scrollY);
    this.contextmenuPoint.y = this.contextmenuPoint.y - this.mapBrowser.nativeElement.getBoundingClientRect().top + window.scrollY;
    this.contextmenuPoint.x = this.contextmenuPoint.x - this.mapBrowser.nativeElement.getBoundingClientRect().left + window.scrollX;
    console.log(this.contextmenuPoint);
  }

  onSearchCoordinate() {
    console.log(this.contextmenuPoint);
  }
}

import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { Action, ActionStore, EntityStore } from '@igo2/common';
import { MediaService, StorageService } from '@igo2/core';
import {
  FEATURE,
  Feature,
  FeatureMotion,
  GoogleLinks,
  IgoMap,
  ImageLayer,
  LayerOptions,
  LayerService,
  MapService,
  MapViewOptions,
  Research,
  SearchResult
} from '@igo2/geo';
import { SearchState } from '@igo2/integration';
import { Coordinate } from 'ol/coordinate';
import { Pixel } from 'ol/pixel';

import * as proj from 'ol/proj';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class AppSearchComponent implements OnInit, OnDestroy {
  public store: ActionStore = new ActionStore([]);

  public igoSearchPointerSummaryEnabled: boolean = false;

  public termSplitter: string = '|';

  public map: IgoMap = new IgoMap({
    overlay: true,
    controls: {
      attribution: {
        collapsed: true
      }
    }
  });

  public view: MapViewOptions = {
    center: [-73, 47.2],
    zoom: 7
  };

  @ViewChild('mapBrowser', { read: ElementRef, static: true })
  mapBrowser: ElementRef;

  public lonlat: Coordinate;
  public mapProjection: string;
  public term: string;

  public settingsChange$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(undefined);

  get searchStore(): EntityStore<SearchResult> {
    return this.searchState.store;
  }

  get isTouchScreen(): boolean {
    return this.mediaService.isTouchScreen();
  }

  public selectedFeature: Feature;
  public igoReverseSearchCoordsFormatEnabled: boolean;

  constructor(
    private mapService: MapService,
    private layerService: LayerService,
    private searchState: SearchState,
    private mediaService: MediaService,
    private storageService: StorageService
  ) {
    this.mapService.setMap(this.map);

    this.layerService
      .createAsyncLayer({
        title: 'OSM',
        baseLayer: true,
        visible: true,
        sourceOptions: {
          type: 'osm'
        }
      } satisfies LayerOptions)
      .subscribe((layer: ImageLayer) => this.map.addLayer(layer));

    this.igoReverseSearchCoordsFormatEnabled =
      (Boolean(this.storageService.get(
        'reverseSearchCoordsFormatEnabled')
      )) || false;
  }

  onPointerSummaryStatusChange(value: boolean): void {
    this.igoSearchPointerSummaryEnabled = value;
  }

  onSearchTermChange(term?: string): void {
    this.term = term;
    this.searchState.setSearchTerm(term);
    const termWithoutHashtag: string = term.replace(/(#[^\s]*)/g, '').trim();
    if (termWithoutHashtag.length < 2) {
      this.searchStore.clear();
      this.selectedFeature = undefined;
    }
  }

  onSearch(event: { research: Research; results: SearchResult[] }): void {
    const results: SearchResult[] = event.results;
    this.searchStore.state.updateAll({ focused: false, selected: false });
    const newResults: SearchResult[] = this.searchStore.entities$.value
      .filter((result: SearchResult) => result.source !== event.research.source)
      .concat(results);
    this.searchStore.updateMany(newResults);
  }

  onReverseCoordsFormatStatusChange(value: boolean): void {
    this.storageService.set('reverseSearchCoordsFormatEnabled', value);
    this.igoReverseSearchCoordsFormatEnabled = value;
  }

  onSearchSettingsChange(): void {
    this.settingsChange$.next(true);
  }

  /**
   * Try to add a feature to the map when it's being focused
   * @internal
   * @param result A search result that could be a feature
   */
  onResultFocus(result: SearchResult<Feature>): void {
    this.tryAddFeatureToMap(result);
    this.selectedFeature = (result satisfies SearchResult<Feature>).data;
  }

  /**
   * Try to add a feature to the map overlay
   * @param layer A search result that could be a feature
   */
  private tryAddFeatureToMap(layer: SearchResult<Feature>): void | undefined {
    if (layer.meta.dataType !== FEATURE) {
      return undefined;
    }

    // Somethimes features have no geometry. It happens with some GetFeatureInfo
    if (layer.data.geometry === undefined) {
      return;
    }

    this.map.searchResultsOverlay.setFeatures(
      [layer.data] satisfies Feature[],
      FeatureMotion.Default
    );
  }

  ngOnInit(): void {
    this.store.load([
      {
        id: 'coordinates',
        title: 'coordinates',
        handler: () => this.searchCoordinate(this.lonlat)
      },
      {
        id: 'googleMaps',
        title: 'googleMap',
        handler: () => this.openGoogleMaps(this.lonlat)
      },
      {
        id: 'googleStreetView',
        title: 'googleStreetView',
        handler: () => this.openGoogleStreetView(this.lonlat)
      }
    ] satisfies Action[]);
  }

  ngOnDestroy(): void {
    this.store.destroy();
  }

  /*
   * Remove a feature to the map overlay
   */
  removeFeatureFromMap(): void {
    this.map.searchResultsOverlay.clear();
  }

  onContextMenuOpen(event: {x: number, y: number}): void {
    const position: Pixel = this.mapPosition(event);
    const coord: Coordinate = this.mapService.getMap().ol.getCoordinateFromPixel(position);
    this.mapProjection = this.mapService.getMap().projectionCode;
    this.lonlat = proj.transform(coord, this.mapProjection, 'EPSG:4326');
  }

  mapPosition(event: { x: number; y: number }): Pixel {
    const contextmenuPoint: { x: number; y: number } = event;
    contextmenuPoint.y =
      contextmenuPoint.y -
      this.mapBrowser.nativeElement.getBoundingClientRect().top +
      window.scrollY;
    contextmenuPoint.x =
      contextmenuPoint.x -
      this.mapBrowser.nativeElement.getBoundingClientRect().left +
      window.scrollX;
    const position: Pixel = [contextmenuPoint.x, contextmenuPoint.y];
    return position;
  }

  searchCoordinate(lonlat: Coordinate): void {
    this.searchStore.clear();
    this.term = !this.igoReverseSearchCoordsFormatEnabled
      ? lonlat.map((c: number) => c.toFixed(6)).join(', ')
      : lonlat
          .reverse()
          .map((c: number) => c.toFixed(6))
          .join(', ');
  }

  openGoogleMaps(lonlat: Coordinate): void {
    window.open(GoogleLinks.getGoogleMapsCoordLink(lonlat[0], lonlat[1]));
  }

  openGoogleStreetView(lonlat: Coordinate): void {
    window.open(GoogleLinks.getGoogleStreetViewLink(lonlat[0], lonlat[1]));
  }
}

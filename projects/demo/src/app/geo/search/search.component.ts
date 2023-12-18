import { NgIf } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { ActionStore, EntityStore } from '@igo2/common';
import { LanguageService, MediaService, StorageService } from '@igo2/core';
import {
  FEATURE,
  Feature,
  FeatureMotion,
  GoogleLinks,
  IgoMap,
  Layer,
  LayerService,
  MapService,
  ProjectionService,
  Research,
  SearchResult
} from '@igo2/geo';
import { SearchState } from '@igo2/integration';

import * as proj from 'ol/proj';

import { BehaviorSubject } from 'rxjs';

import { IgoActionbarModule } from '../../../../../../packages/common/src/lib/action/actionbar/actionbar.module';
import { IgoContextMenuModule } from '../../../../../../packages/common/src/lib/context-menu/context-menu.module';
import { IgoPanelModule } from '../../../../../../packages/common/src/lib/panel/panel.module';
import { IgoFeatureDetailsModule } from '../../../../../../packages/geo/src/lib/feature/feature-details/feature-details.module';
import { IgoMapModule } from '../../../../../../packages/geo/src/lib/map/map.module';
import { IgoSearchBarModule } from '../../../../../../packages/geo/src/lib/search/search-bar/search-bar.module';
import { IgoSearchResultsModule } from '../../../../../../packages/geo/src/lib/search/search-results/search-results.module';
import { IgoSearchModule } from '../../../../../../packages/geo/src/lib/search/search.module';
import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [
    DocViewerComponent,
    ExampleViewerComponent,
    NgIf,
    IgoMapModule,
    IgoContextMenuModule,
    IgoSearchModule,
    IgoPanelModule,
    IgoSearchBarModule,
    IgoSearchResultsModule,
    IgoFeatureDetailsModule,
    IgoActionbarModule
  ]
})
export class AppSearchComponent implements OnInit, OnDestroy {
  public store = new ActionStore([]);

  public igoSearchPointerSummaryEnabled: boolean = false;

  public termSplitter: string = '|';

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

  @ViewChild('mapBrowser', { read: ElementRef, static: true })
  mapBrowser: ElementRef;

  public lonlat;
  public mapProjection: string;
  public term: string;

  public settingsChange$ = new BehaviorSubject<boolean>(undefined);

  get searchStore(): EntityStore<SearchResult> {
    return this.searchState.store;
  }

  get isTouchScreen(): boolean {
    return this.mediaService.isTouchScreen();
  }

  public selectedFeature: Feature;
  public igoReverseSearchCoordsFormatEnabled: boolean;

  constructor(
    private languageService: LanguageService,
    private projectionService: ProjectionService,
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
        sourceOptions: {
          type: 'osm'
        }
      })
      .subscribe((layer) => {
        this.osmLayer = layer;
        this.map.addLayer(layer);
      });

    this.igoReverseSearchCoordsFormatEnabled =
      (this.storageService.get(
        'reverseSearchCoordsFormatEnabled'
      ) as boolean) || false;
  }

  onPointerSummaryStatusChange(value) {
    this.igoSearchPointerSummaryEnabled = value;
  }

  onSearchTermChange(term?: string) {
    this.term = term;
    this.searchState.setSearchTerm(term);
    const termWithoutHashtag = term.replace(/(#[^\s]*)/g, '').trim();
    if (termWithoutHashtag.length < 2) {
      this.searchStore.clear();
      this.selectedFeature = undefined;
    }
  }

  onSearch(event: { research: Research; results: SearchResult[] }) {
    const results = event.results;
    this.searchStore.state.updateAll({ focused: false, selected: false });
    const newResults = this.searchStore.entities$.value
      .filter((result: SearchResult) => result.source !== event.research.source)
      .concat(results);
    this.searchStore.updateMany(newResults);
  }

  onReverseCoordsFormatStatusChange(value) {
    this.storageService.set('reverseSearchCoordsFormatEnabled', value);
    this.igoReverseSearchCoordsFormatEnabled = value;
  }

  onSearchSettingsChange() {
    this.settingsChange$.next(true);
  }

  /**
   * Try to add a feature to the map when it's being focused
   * @internal
   * @param result A search result that could be a feature
   */
  onResultFocus(result: SearchResult) {
    this.tryAddFeatureToMap(result);
    this.selectedFeature = (result as SearchResult<Feature>).data;
  }

  /**
   * Try to add a feature to the map overlay
   * @param layer A search result that could be a feature
   */
  private tryAddFeatureToMap(layer: SearchResult) {
    if (layer.meta.dataType !== FEATURE) {
      return undefined;
    }

    // Somethimes features have no geometry. It happens with some GetFeatureInfo
    if (layer.data.geometry === undefined) {
      return;
    }

    this.map.searchResultsOverlay.setFeatures(
      [layer.data] as Feature[],
      FeatureMotion.Default
    );
  }

  ngOnInit() {
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
    ]);
  }

  ngOnDestroy() {
    this.store.destroy();
  }

  /*
   * Remove a feature to the map overlay
   */
  removeFeatureFromMap() {
    this.map.searchResultsOverlay.clear();
  }

  onContextMenuOpen(event: { x: number; y: number }) {
    const position = this.mapPosition(event);
    const coord = this.mapService.getMap().ol.getCoordinateFromPixel(position);
    this.mapProjection = this.mapService.getMap().projection;
    this.lonlat = proj.transform(coord, this.mapProjection, 'EPSG:4326');
  }

  mapPosition(event: { x: number; y: number }) {
    const contextmenuPoint = event;
    contextmenuPoint.y =
      contextmenuPoint.y -
      this.mapBrowser.nativeElement.getBoundingClientRect().top +
      window.scrollY;
    contextmenuPoint.x =
      contextmenuPoint.x -
      this.mapBrowser.nativeElement.getBoundingClientRect().left +
      window.scrollX;
    const position = [contextmenuPoint.x, contextmenuPoint.y];
    return position;
  }

  searchCoordinate(lonlat) {
    this.searchStore.clear();
    this.term = !this.igoReverseSearchCoordsFormatEnabled
      ? lonlat.map((c) => c.toFixed(6)).join(', ')
      : lonlat
          .reverse()
          .map((c) => c.toFixed(6))
          .join(', ');
  }

  openGoogleMaps(lonlat) {
    window.open(GoogleLinks.getGoogleMapsCoordLink(lonlat[0], lonlat[1]));
  }

  openGoogleStreetView(lonlat) {
    window.open(GoogleLinks.getGoogleStreetViewLink(lonlat[0], lonlat[1]));
  }
}

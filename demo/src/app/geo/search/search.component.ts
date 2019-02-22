import {Component} from '@angular/core';

import {LanguageService} from '@igo2/core';
import {EntityStore} from '@igo2/common';
import {
  IgoMap,
  LayerService,
  MapService,
  Layer,
  Research,
  SearchResult
} from '@igo2/geo';

import {SearchState} from '@igo2/integration';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class AppSearchComponent {
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

  get searchStore(): EntityStore<SearchResult> {
    return this.searchState.store;
  }

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
}

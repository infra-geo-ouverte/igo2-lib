import { Injectable } from '@angular/core';

import {
  EntityRecord,
  EntityStore,
  EntityStoreFilterCustomFuncStrategy,
  EntityStoreStrategyFuncOptions
} from '@igo2/common';
import { ConfigService, StorageService } from '@igo2/core';
import {
  CommonVectorStyleOptions,
  Feature,
  FeatureMotion,
  FeatureStore,
  FeatureWorkspace,
  OverlayStyleOptions,
  SearchResult,
  SearchSource,
  SearchSourceService
} from '@igo2/geo';

import { BehaviorSubject, Subscription } from 'rxjs';

import { MapState } from '../map';
import { WorkspaceState } from '../workspace/workspace.state';

/**
 * Define the FeatureMotion to apply when adding the SearchResult to the map as an overlay.
 */
export interface SearchFeatureMotion {
  selected?: FeatureMotion;
  focus?: FeatureMotion;
}

/**
 * Service that holds the state of the search module
 */
@Injectable({
  providedIn: 'root'
})
export class SearchState {
  public searchLayerStores: FeatureStore<Feature>[] = [];
  public searchOverlayStyle: CommonVectorStyleOptions = {};
  public searchOverlayStyleSelection: CommonVectorStyleOptions = {};
  public searchOverlayStyleFocus: CommonVectorStyleOptions = {};

  public focusedOrResolution$$: Subscription;
  public selectedOrResolution$$: Subscription;

  /**
   * Default feature motion are:
   * on selection = FeatureMotion.Default and
   * on focus = FeatureMotion.None
   */
  public featureMotion: SearchFeatureMotion = {
    selected: FeatureMotion.Default,
    focus: FeatureMotion.None
  };

  readonly searchTermSplitter$: BehaviorSubject<string> = new BehaviorSubject(
    '|'
  );

  readonly searchTerm$: BehaviorSubject<string> = new BehaviorSubject(
    undefined
  );

  readonly searchType$: BehaviorSubject<string> = new BehaviorSubject(
    undefined
  );

  readonly searchDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  readonly searchResultsGeometryEnabled$: BehaviorSubject<boolean> =
    new BehaviorSubject(false);

  readonly searchSettingsChange$: BehaviorSubject<boolean> =
    new BehaviorSubject(undefined);

  readonly selectedResult$: BehaviorSubject<SearchResult> = new BehaviorSubject(
    undefined
  );

  /**
   * Store that holds the search results
   */
  readonly store = new EntityStore<SearchResult>([]);

  /**
   * Search types currently enabled in the search source service
   */
  get searchTypes(): string[] {
    return this.searchSourceService
      .getEnabledSources()
      .map((source: SearchSource) => (source.constructor as any).type);
  }

  constructor(
    private searchSourceService: SearchSourceService,
    private storageService: StorageService,
    private workspaceState: WorkspaceState,
    private configService: ConfigService,
    private mapState: MapState
  ) {
    const searchOverlayStyle: OverlayStyleOptions =
      this.configService.getConfig('searchOverlayStyle');
    if (searchOverlayStyle) {
      this.searchOverlayStyle = searchOverlayStyle.base;
      this.searchOverlayStyleSelection = searchOverlayStyle.selection;
      this.searchOverlayStyleFocus = searchOverlayStyle.focus;
    }

    const searchResultsGeometryEnabled = this.storageService.get(
      'searchResultsGeometryEnabled'
    ) as boolean;
    if (searchResultsGeometryEnabled) {
      this.searchResultsGeometryEnabled$.next(searchResultsGeometryEnabled);
    }
    this.store.addStrategy(this.createCustomFilterTermStrategy(), false);

    const wksSource = this.searchSourceService
      .getSources()
      .find((source) => source.getId() === 'workspace');
    this.workspaceState.store.entities$.subscribe((e) => {
      const searchableWks = e.filter(
        (fw) =>
          fw instanceof FeatureWorkspace &&
          fw.layer.options.workspace.searchIndexEnabled
      );
      this.searchSourceService.setWorkspaces(wksSource, searchableWks);
    });
    this.monitorLayerDeletion();
  }

  private monitorLayerDeletion() {
    this.mapState.map.layers$.subscribe((layers) => {
      this.searchLayerStores.forEach((store) => {
        let layer = layers.find((l) => l.id === store.layer.id);
        if (!layer) {
          const index = this.searchLayerStores.indexOf(store);
          this.searchLayerStores.splice(index, 1);
        }
      });
    });
  }

  private createCustomFilterTermStrategy(): EntityStoreFilterCustomFuncStrategy {
    const filterClauseFunc = (record: EntityRecord<SearchResult>) => {
      return record.entity.meta.score === 100;
    };
    return new EntityStoreFilterCustomFuncStrategy({
      filterClauseFunc
    } as EntityStoreStrategyFuncOptions);
  }

  /**
   * Activate custom strategy
   *
   */
  activateCustomFilterTermStrategy() {
    const strategy = this.store.getStrategyOfType(
      EntityStoreFilterCustomFuncStrategy
    );
    if (strategy !== undefined) {
      strategy.activate();
    }
  }

  /**
   * Deactivate custom strategy
   *
   */
  deactivateCustomFilterTermStrategy() {
    const strategy = this.store.getStrategyOfType(
      EntityStoreFilterCustomFuncStrategy
    );
    if (strategy !== undefined) {
      strategy.deactivate();
    }
  }

  enableSearch() {
    this.searchDisabled$.next(false);
  }

  disableSearch() {
    this.searchDisabled$.next(true);
  }

  setSearchTerm(searchTerm: string) {
    this.searchTerm$.next(searchTerm);
  }

  setSearchType(searchType: string) {
    this.searchSourceService.enableSourcesByType(searchType);
    this.searchType$.next(searchType);
  }

  setSearchSettingsChange() {
    this.searchSettingsChange$.next(true);
  }

  setSelectedResult(result: SearchResult) {
    this.selectedResult$.next(result);
  }

  setSearchResultsGeometryStatus(value) {
    this.storageService.set('searchResultsGeometryEnabled', value);
    this.searchResultsGeometryEnabled$.next(value);
  }
}

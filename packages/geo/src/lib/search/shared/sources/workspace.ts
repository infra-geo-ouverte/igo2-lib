import { Inject, Injectable } from '@angular/core';

import { LanguageService, StorageService } from '@igo2/core';

import pointOnFeature from '@turf/point-on-feature';
import { SimpleDocumentSearchResultSetUnit } from 'flexsearch';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { FEATURE } from '../../../feature/shared/feature.enums';
import { Feature } from '../../../feature/shared/feature.interfaces';
import { Layer } from '../../../layer/shared/layers/layer';
import { GoogleLinks } from '../../../utils/googleLinks';
import { SearchResult, TextSearch } from '../search.interfaces';
import { computeTermSimilarity } from '../search.utils';
import { SearchSource } from './source';
import { SearchSourceOptions, TextSearchOptions } from './source.interfaces';
import { WorkspaceData } from './workspace.interfaces';

/**
 * Workspace search source
 */
@Injectable()
export class WorkspaceSearchSource extends SearchSource implements TextSearch {
  static id = 'workspace';
  static type = FEATURE;
  title$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  get title(): string {
    return this.title$.getValue();
  }

  constructor(
    private languageService: LanguageService,
    storageService: StorageService,
    @Inject('options') options: SearchSourceOptions
  ) {
    super(options, storageService);

    this.languageService.translate
      .get(this.options.title)
      .subscribe((title) => this.title$.next(title));
  }

  getId(): string {
    return WorkspaceSearchSource.id;
  }

  getType(): string {
    return WorkspaceSearchSource.type;
  }

  getDefaultOptions(): SearchSourceOptions {
    const limit: Number = 5;

    return {
      title: 'igo.geo.search.workspace.name',
      searchUrl: undefined,
      settings: [
        {
          type: 'checkbox',
          title: 'datasets',
          name: 'datasets',
          values: []
        },
        {
          type: 'radiobutton',
          title: 'results limit',
          name: 'limit',
          values: [
            { title: '1', value: 1, enabled: limit === 1 },
            { title: '5', value: 5, enabled: limit === 5 || !limit },
            { title: '10', value: 10, enabled: limit === 10 },
            { title: '25', value: 25, enabled: limit === 25 },
            { title: '50', value: 50, enabled: limit === 50 }
          ]
        }
      ]
    };
  }

  /**
   * Search a location by name or keyword
   * @param term Location name or keyword
   * @returns Observable of <SearchResult<Feature>[]
   */
  search(
    term: string,
    options?: TextSearchOptions
  ): Observable<SearchResult<Feature>[]> {
    const limitSetting = this.settings.find((s) => s.name === 'limit');
    const limitValue =
      (limitSetting.values.find((v) => v.enabled).value as number) || 5;
    this.options.params.limit = limitValue.toLocaleString();
    const results: WorkspaceData[] = [];
    this.options.params.page = (options.page || 1).toLocaleString();
    const page = options.page || 1;
    const datasets = this.options.params.datasets.split(',');
    this.featureStoresWithIndex
      .filter(
        (fswi) => fswi.searchDocument && datasets.includes(fswi.layer.title)
      )
      .map((fswi) => {
        const termToUse = term;
        fswi.searchDocument
          .search(termToUse, { limit: page * limitValue })
          .map((i) => {
            const foundIn: SimpleDocumentSearchResultSetUnit = i;
            const field = foundIn.field;
            foundIn.result.map((index) => {
              const feature = fswi.index.get(index);
              const score = computeTermSimilarity(
                termToUse.trim(),
                feature.properties[field]
              );
              results.push({ index, feature, layer: fswi.layer, field, score });
            });
          });
      });

    results.sort((a, b) => (a.score > b.score ? -1 : 1));
    const gettedIndex = [];
    const sortedResultToProcess: WorkspaceData[] = [];
    results.map((r) => {
      if (!gettedIndex.includes(r.index)) {
        gettedIndex.push(r.index);
        sortedResultToProcess.push(r);
      }
    });

    return of(
      this.extractResults(
        sortedResultToProcess
          .sort((a, b) => (a.score > b.score ? -1 : 1))
          .slice(0, page * limitValue)
      )
    );
  }

  private extractResults(results: WorkspaceData[]): SearchResult<Feature>[] {
    return results.map((result) => this.dataToResult(result, results.length));
  }

  private dataToResult(
    data: WorkspaceData,
    resultsCnt: number
  ): SearchResult<Feature> {
    const properties = this.computeProperties(data);
    const id = [this.getId(), properties.type, data.index].join('.');
    const titleHtml = data.feature.properties[data.field];
    const subtitleHtml2 = '<br><small> ' + data.layer.title + '</small>';

    return {
      source: this,
      data: {
        type: FEATURE,
        projection: 'EPSG:4326',
        geometry: data.feature.geometry,
        extent: data.feature.extent,
        properties,
        meta: {
          id,
          title: data.feature.properties[data.field],
          alias: this.getAllowedFieldsAndAlias(data.layer)
        }
      },
      meta: {
        dataType: FEATURE,
        id,
        title: data.feature.meta.title,
        titleHtml: titleHtml + subtitleHtml2,
        icon: 'map-marker',
        score: data.score,
        nextPage:
          resultsCnt % +this.options.params.limit === 0 &&
          +this.options.params.page < 10
      }
    } as SearchResult<Feature>;
  }

  private getAllowedFieldsAndAlias(layer: Layer) {
    let allowedFieldsAndAlias;
    if (
      layer.options?.source?.options?.sourceFields &&
      layer.options.source.options.sourceFields.length >= 1
    ) {
      allowedFieldsAndAlias = {};
      layer.options.source.options.sourceFields.forEach((sourceField) => {
        const alias = sourceField.alias ? sourceField.alias : sourceField.name;
        allowedFieldsAndAlias[sourceField.name] = alias;
      });
    }
    return allowedFieldsAndAlias;
  }

  private computeProperties(data: WorkspaceData): { [key: string]: any } {
    if (!data.feature.geometry) {
      return Object.assign(
        { type: data.layer.title + '.' + data.field },
        data.feature.properties
      );
    }
    const googleLinksProperties: {
      GoogleMaps: string;
      GoogleStreetView?: string;
    } = {
      GoogleMaps: ''
    };
    let googleMaps;
    if (data.feature.geometry.type === 'Point') {
      googleMaps = GoogleLinks.getGoogleMapsCoordLink(
        data.feature.geometry.coordinates[0],
        data.feature.geometry.coordinates[1]
      );
    } else {
      const point = pointOnFeature(data.feature.geometry);
      googleMaps = GoogleLinks.getGoogleMapsCoordLink(
        point.geometry.coordinates[0],
        point.geometry.coordinates[1]
      );
    }
    googleLinksProperties.GoogleMaps =
      '<a href=' +
      googleMaps +
      ' target="_blank">' +
      this.languageService.translate.instant('igo.geo.searchByCoord') +
      '</a>';
    if (data.feature.geometry.type === 'Point') {
      googleLinksProperties.GoogleStreetView =
        GoogleLinks.getGoogleStreetViewLink(
          data.feature.geometry.coordinates[0],
          data.feature.geometry.coordinates[1]
        );
    }
    const routing: {
      Route: string;
    } = {
      Route:
        '<span class="routing"> <u>' +
        this.languageService.translate.instant('igo.geo.seeRouting') +
        '</u> </span>'
    };
    return Object.assign(
      { type: data.feature.sourceId },
      data.feature.properties,
      googleLinksProperties,
      routing
    );
  }
}

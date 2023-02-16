import { Injectable, Inject, Injector } from '@angular/core';

import { Observable, of, BehaviorSubject } from 'rxjs';

import { LanguageService, StorageService } from '@igo2/core';

import { FEATURE, Feature } from '../../../feature';

import { SearchResult } from '../search.interfaces';
import { SearchSource, TextSearch } from './source';
import {
  SearchSourceOptions,
  TextSearchOptions
} from './source.interfaces';
import { featureToSearchResult } from '../search.utils';


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
    @Inject('options') options: SearchSourceOptions,
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

  protected getDefaultOptions(): SearchSourceOptions {
    const limit = 5

    const types = [
            'adresses',
          ];

    return {
      title: 'igo.geo.search.workspace.name',
      searchUrl: undefined,
      settings: [
        {
          type: 'checkbox',
          title: 'results type',
          name: 'type',
          values: [
            {
              title: 'igo.geo.search.icherche.type.address',
              value: 'adresses',
              enabled: types.indexOf('adresses') !== -1,
              hashtags: ['adresse']
            }
          ]
        },
        {
          type: 'radiobutton',
          title: 'results limit',
          name: 'limit',
          values: [
            {
              title: '1',
              value: 1,
              enabled: false
            },
            {
              title: '5',
              value: 5,
              enabled: true
            },
            {
              title: '10',
              value: 10,
              enabled: false
            },
            {
              title: '25',
              value: 25,
              enabled: false
            },
            {
              title: '50',
              value: 50,
              enabled: false
            }
          ]
        },
        {
          type: 'radiobutton',
          title: 'restrictExtent',
          name: 'loc',
          values: [
            {
              title: 'igo.geo.search.workspace.restrictExtent.map',
              value: 'true',
              enabled: false
            },
            {
              title: 'igo.geo.search.workspace.restrictExtent.whole',
              value: 'false',
              enabled: true
            }
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

    console.log('allo', term, options, this.featureStoresWithIndex)

    const r = []
    this.featureStoresWithIndex
      .filter(fswi => fswi.searchIndex)
      .map(fswi => fswi.searchIndex.search(term).map(i => {
       // console.log('thi', fswi.layer.title)
        r.push(featureToSearchResult(fswi.index.get(i), this))

      }))





    
    // featureToSearchResult¸
    return of(r)
  }
}
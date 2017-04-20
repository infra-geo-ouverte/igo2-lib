import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { RequestService } from '../../core';
import { Feature, FeatureService } from '../../feature';

import { SearchSourceService } from './search-source.service';
import { SearchSource } from '../search-sources/search-source';


@Injectable()
export class SearchService {

  private subscriptions: Subscription[] = [];

  constructor(private searchSourceService: SearchSourceService,
              private featureService: FeatureService,
              private requestService: RequestService) {
  }

  search(term: string) {
    const sources = this.searchSourceService.sources;

    this.unsubscribe();
    this.subscriptions = sources.map((source: SearchSource) =>
      this.searchSource(source, term));
  }

  searchSource(source: SearchSource, term?: string) {
    const request = source.search(term);

    return this.requestService
      .register(request, source.getName())
      .subscribe((features: Feature[]) =>
        this.handleFeatures(features, source));
  }

  private unsubscribe() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  private handleFeatures(features: Feature[], source: SearchSource) {
    this.featureService.updateFeatures(features, source.getName());
  }
}

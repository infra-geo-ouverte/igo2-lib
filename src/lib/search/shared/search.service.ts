import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { MessageService } from '../../core';
import { Feature, FeatureService } from '../../feature';

import { SearchSourceService } from './search-source.service';
import { SearchSource } from '../search-sources/search-source';


@Injectable()
export class SearchService {

  private subscriptions: Subscription[] = [];

  constructor(private searchSourceService: SearchSourceService,
              private featureService: FeatureService,
              private messageService: MessageService) {
  }

  search(term: string) {
    if (!term || term === '') {
      this.featureService.clear();
      return;
    }

    this.unsubscribe();

    this.subscriptions = this.searchSourceService.sources
      .filter((source: SearchSource) => source.enabled)
      .map((source: SearchSource) => this.searchSource(source, term));
  }

  searchSource(source: SearchSource, term?: string) {
    const request = source.search(term);

    return request.subscribe(
      (features: Feature[]) => this.handleFeatures(features, source),
      (err) => {
        err.error.title = source.getName();
        this.messageService.showError(err);
      }
    );
  }

  private unsubscribe() {
    this.subscriptions.forEach((sub: Subscription) => sub.unsubscribe());
  }

  private handleFeatures(features: Feature[], source: SearchSource) {
    const sourcesToKeep = this.searchSourceService.sources.map(s => s.getName());
    this.featureService.updateFeatures(features, source.getName(), sourcesToKeep);
  }
}

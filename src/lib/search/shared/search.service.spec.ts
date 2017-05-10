import { TestBed, inject } from '@angular/core/testing';
import { HttpModule, JsonpModule } from '@angular/http';

import { ActivityService, RequestService, MessageService } from '../../core';

import { SearchService } from './search.service';
import { provideSearchSourceService } from './search-source.service';
import { FeatureService } from '../../feature';
import { provideSearchSourceOptions, provideNominatimSearchSource } from '../search-sources';


describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        JsonpModule
      ],
      providers: [
        ActivityService,
        RequestService,
        MessageService,
        FeatureService,
        SearchService,
        provideSearchSourceOptions({
          limit: 1
        }),
        provideSearchSourceService(),
        provideNominatimSearchSource()
      ]
    });
  });

  it('should ...', inject([SearchService], (service: SearchService) => {
    expect(service).toBeTruthy();
  }));
});

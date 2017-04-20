import { TestBed, inject } from '@angular/core/testing';
import { HttpModule, JsonpModule } from '@angular/http';

import { RequestService, MessageService } from '../../core';

import { SearchService } from './search.service';
import { FeatureService } from '../../feature';
import { provideDefaultSearchSources,
         provideSearchSourceService } from '../module';

describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        JsonpModule
      ],
      providers: [
        RequestService,
        MessageService,
        FeatureService,
        SearchService,
        provideSearchSourceService(),
        ...provideDefaultSearchSources()
      ]
    });
  });

  it('should ...', inject([SearchService], (service: SearchService) => {
    expect(service).toBeTruthy();
  }));
});

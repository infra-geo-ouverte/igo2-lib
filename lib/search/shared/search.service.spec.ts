import { TestBed, inject } from '@angular/core/testing';
import { HttpModule, JsonpModule } from '@angular/http';

import { RequestService, MessageService } from '../../core';

import { SearchService } from './search.service';
import { provideDefaultSearchSources,
         provideSearchSourceService } from '../search';

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

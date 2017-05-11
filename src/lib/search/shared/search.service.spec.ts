import { TestBed, inject } from '@angular/core/testing';
import { HttpModule, JsonpModule } from '@angular/http';

import { IgoCoreModule } from '../../core';

import { SearchService } from './search.service';
import { provideSearchSourceService } from './search-source.service';
import { FeatureService } from '../../feature';
import { provideSearchSourceOptions, provideNominatimSearchSource } from '../search-sources';


describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        JsonpModule,
        IgoCoreModule.forRoot()
      ],
      providers: [
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

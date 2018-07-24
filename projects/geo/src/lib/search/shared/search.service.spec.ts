import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { IgoCoreModule } from '../../core';

import { SearchService } from './search.service';
import { provideSearchSourceService } from './search-source.service';
import { FeatureService } from '../../feature';
import { provideNominatimSearchSource } from '../search-sources';


describe('SearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        IgoCoreModule.forRoot()
      ],
      providers: [
        FeatureService,
        SearchService,
        provideSearchSourceService(),
        provideNominatimSearchSource()
      ]
    });
  });

  it('should ...', inject([SearchService], (service: SearchService) => {
    expect(service).toBeTruthy();
  }));
});

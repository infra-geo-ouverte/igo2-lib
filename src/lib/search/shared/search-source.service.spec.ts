import { TestBed, inject } from '@angular/core/testing';
import { HttpModule, JsonpModule } from '@angular/http';

import { provideSearchSourceService, SearchSourceService } from './search-source.service';
import { provideSearchSourceOptions, SearchSource } from '../search-sources';


describe('SearchSourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        JsonpModule
      ],
      providers: [
        SearchSource,
        provideSearchSourceOptions({
          limit: 1
        }),
        provideSearchSourceService()
      ]
    });
  });

  it('should ...', inject([SearchSourceService], (service: SearchSourceService) => {
    expect(service).toBeTruthy();
  }));
});

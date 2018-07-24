import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { provideSearchSourceService, SearchSourceService } from './search-source.service';
import { SearchSource } from '../search-sources';


describe('SearchSourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        SearchSource,
        provideSearchSourceService()
      ]
    });
  });

  it('should ...', inject([SearchSourceService], (service: SearchSourceService) => {
    expect(service).toBeTruthy();
  }));
});

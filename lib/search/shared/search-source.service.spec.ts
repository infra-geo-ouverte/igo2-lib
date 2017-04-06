import { TestBed, inject } from '@angular/core/testing';
import { HttpModule, JsonpModule } from '@angular/http';

import { SearchSourceService } from './search-source.service';
import {
  provideSearchSourceService
} from '../search';

describe('SearchSourceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        JsonpModule
      ],
      providers: [
        provideSearchSourceService()
      ]
    });
  });

  it('should ...', inject([SearchSourceService], (service: SearchSourceService) => {
    expect(service).toBeTruthy();
  }));
});

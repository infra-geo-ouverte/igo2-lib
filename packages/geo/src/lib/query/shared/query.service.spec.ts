import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { provideMockTranslation } from '@igo2/core/language';
import { IgoMessageModule } from '@igo2/core/message';

import { QueryService } from './query.service';

describe('QueryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, IgoMessageModule],
      providers: [QueryService, provideMockTranslation()]
    });
  });

  it('should ...', inject([QueryService], (service: QueryService) => {
    expect(service).toBeTruthy();
  }));
});

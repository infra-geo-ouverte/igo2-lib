import { TestBed, inject } from '@angular/core/testing';

import { provideMockTranslation } from '@igo2/core/language';
import { IgoMessageModule } from '@igo2/core/message';

import { mergeTestConfig } from 'packages/geo/test-config';

import { QueryService } from './query.service';

describe('QueryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [IgoMessageModule],
        providers: [QueryService, provideMockTranslation()]
      })
    );
  });

  it('should ...', inject([QueryService], (service: QueryService) => {
    expect(service).toBeTruthy();
  }));
});

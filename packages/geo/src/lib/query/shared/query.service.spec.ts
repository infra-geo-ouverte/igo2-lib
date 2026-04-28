import { TestBed, inject } from '@angular/core/testing';

import { provideMessage } from '@igo2/core/message';

import { QueryService } from './query.service';

describe('QueryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMessage()]
    });
  });

  it('should create', inject([QueryService], (service: QueryService) => {
    expect(service).toBeTruthy();
  }));
});

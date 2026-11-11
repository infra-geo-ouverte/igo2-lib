import { inject } from '@angular/core/testing';

import { QueryService } from './query.service';

describe('QueryService', () => {
  it('should create', inject([QueryService], (service: QueryService) => {
    expect(service).toBeTruthy();
  }));
});

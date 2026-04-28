import { inject } from '@angular/core/testing';

import { WktService } from './wkt.service';

describe('WktService', () => {
  it('should create', inject([WktService], (service: WktService) => {
    expect(service).toBeTruthy();
  }));
});

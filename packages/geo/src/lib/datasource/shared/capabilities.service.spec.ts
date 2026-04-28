import { inject } from '@angular/core/testing';

import { CapabilitiesService } from './capabilities.service';

describe('CapabilitiesService', () => {
  it('should create', inject(
    [CapabilitiesService],
    (service: CapabilitiesService) => {
      expect(service).toBeTruthy();
    }
  ));
});

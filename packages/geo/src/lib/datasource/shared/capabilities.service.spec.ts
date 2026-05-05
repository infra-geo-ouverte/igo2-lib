import { TestBed, inject } from '@angular/core/testing';

import { mergeTestConfig } from '../../../../test-config';
import { CapabilitiesService } from './capabilities.service';

describe('CapabilitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(mergeTestConfig({}));
  });

  it('should ...', inject(
    [CapabilitiesService],
    (service: CapabilitiesService) => {
      expect(service).toBeTruthy();
    }
  ));
});

import { TestBed, inject } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/geo/test-config';

import { CapabilitiesService } from './capabilities.service';

describe('CapabilitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [],
        providers: [CapabilitiesService]
      })
    );
  });

  it('should ...', inject(
    [CapabilitiesService],
    (service: CapabilitiesService) => {
      expect(service).toBeTruthy();
    }
  ));
});

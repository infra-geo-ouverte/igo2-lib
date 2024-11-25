import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { CapabilitiesService } from './capabilities.service';

describe('CapabilitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        CapabilitiesService,
        provideHttpClient(withInterceptorsFromDi())
      ]
    });
  });

  it('should ...', inject(
    [CapabilitiesService],
    (service: CapabilitiesService) => {
      expect(service).toBeTruthy();
    }
  ));
});

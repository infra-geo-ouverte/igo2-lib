import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

import { CapabilitiesService } from './capabilities.service';

describe('CapabilitiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientJsonpModule],
      providers: [CapabilitiesService]
    });
  });

  it('should ...', inject(
    [CapabilitiesService],
    (service: CapabilitiesService) => {
      expect(service).toBeTruthy();
    }
  ));
});

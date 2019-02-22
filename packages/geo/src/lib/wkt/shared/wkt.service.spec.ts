import { TestBed, inject } from '@angular/core/testing';

import { MapService } from '../../map';
import { WktService } from './wkt.service';

describe('WktService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [WktService, MapService]
    });
  });

  it('should ...', inject([WktService], (service: WktService) => {
    expect(service).toBeTruthy();
  }));
});

import { TestBed, inject } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/geo/test-config';

import { MapService } from '../../map/shared';
import { WktService } from './wkt.service';

describe('WktService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [],
        providers: [WktService, MapService]
      })
    );
  });

  it('should ...', inject([WktService], (service: WktService) => {
    expect(service).toBeTruthy();
  }));
});

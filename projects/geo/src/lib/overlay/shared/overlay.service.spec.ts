import { TestBed, inject } from '@angular/core/testing';

import { FeatureService } from '../../feature';

import { OverlayService } from './overlay.service';

describe('OverlayService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [FeatureService, OverlayService]
    });
  });

  it('should ...', inject([OverlayService], (service: OverlayService) => {
    expect(service).toBeTruthy();
  }));
});

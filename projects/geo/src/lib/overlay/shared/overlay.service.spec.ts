import { TestBed, inject } from '@angular/core/testing';

import { OverlayService } from './overlay.service';

describe('OverlayService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [OverlayService]
    });
  });

  it('should ...', inject([OverlayService], (service: OverlayService) => {
    expect(service).toBeTruthy();
  }));
});

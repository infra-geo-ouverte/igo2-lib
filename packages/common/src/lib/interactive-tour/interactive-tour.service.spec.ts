import { TestBed } from '@angular/core/testing';

import { InteractiveTourService } from './interactive-tour.service';

describe('InteractiveTourService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InteractiveTourService = TestBed.get(InteractiveTourService);
    expect(service).toBeTruthy();
  });
});

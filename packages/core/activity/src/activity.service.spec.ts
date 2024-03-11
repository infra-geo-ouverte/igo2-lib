import { TestBed, inject } from '@angular/core/testing';

import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivityService]
    });
  });

  it('should ...', inject([ActivityService], (service: ActivityService) => {
    expect(service).toBeTruthy();
  }));
});

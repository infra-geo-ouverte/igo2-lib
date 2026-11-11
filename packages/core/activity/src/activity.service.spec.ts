import { inject } from '@angular/core/testing';

import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  it('should create', inject([ActivityService], (service: ActivityService) => {
    expect(service).toBeTruthy();
  }));
});

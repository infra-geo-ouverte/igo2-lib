import { TestBed, inject } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/core/test-config';

import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        providers: [ActivityService]
      })
    );
  });

  it('should ...', inject([ActivityService], (service: ActivityService) => {
    expect(service).toBeTruthy();
  }));
});

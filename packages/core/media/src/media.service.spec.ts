import { TestBed, inject } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/core/test-config';

import { MediaService } from './media.service';

describe('MediaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        providers: [MediaService]
      })
    );
  });

  it('should ...', inject([MediaService], (service: MediaService) => {
    expect(service).toBeTruthy();
  }));
});

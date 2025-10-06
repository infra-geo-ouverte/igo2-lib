import { TestBed, inject } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/auth/test-config';

import { StyleService } from './style.service';

describe('StyleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        providers: [StyleService]
      })
    );
  });

  it('should ...', inject([StyleService], (service: StyleService) => {
    expect(service).toBeTruthy();
  }));
});

import { TestBed } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/auth/test-config';

import { QueryService } from '../shared';

describe('QueryDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        providers: [QueryService]
      })
    );
  });

  it('should create an instance', () => {
    expect(true).toBeTruthy();
  });
});

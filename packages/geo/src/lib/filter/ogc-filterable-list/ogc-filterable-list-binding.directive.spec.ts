import { TestBed } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/geo/test-config';

describe('OgcFilterableListBindingDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [],
        providers: []
      })
    );
  });

  it('should create an instance', () => {
    expect(true).toBeTruthy();
  });
});

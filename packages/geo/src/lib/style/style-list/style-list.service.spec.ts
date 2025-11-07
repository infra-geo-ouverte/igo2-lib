import { TestBed, inject } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/geo/test-config';

import { StyleListService } from './style-list.service';

describe('StyleListService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [],
        providers: [StyleListService]
      })
    );
  });

  it('should ...', inject([StyleListService], (service: StyleListService) => {
    expect(service).toBeTruthy();
  }));
});

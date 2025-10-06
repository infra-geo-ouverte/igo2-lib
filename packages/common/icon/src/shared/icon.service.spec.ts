import { TestBed } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/common/test-config';

import { IconService } from './icon.service';

describe('IconService', () => {
  let service: IconService;

  beforeEach(() => {
    TestBed.configureTestingModule(mergeTestConfig({}));
    service = TestBed.inject(IconService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

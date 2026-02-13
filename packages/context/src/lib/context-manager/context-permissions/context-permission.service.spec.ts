import { TestBed } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/context/test-config';

import { ContextPermissionService } from './context-permission.service';

describe('ContextPermissionService', () => {
  let service: ContextPermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule(mergeTestConfig({}));
    service = TestBed.inject(ContextPermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

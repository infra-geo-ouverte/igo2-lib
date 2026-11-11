import { TestBed } from '@angular/core/testing';

import { ContextPermissionService } from './context-permission.service';

describe('ContextPermissionService', () => {
  let service: ContextPermissionService;

  beforeEach(() => {
    service = TestBed.inject(ContextPermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

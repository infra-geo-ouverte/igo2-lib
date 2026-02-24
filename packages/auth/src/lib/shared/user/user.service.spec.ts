import { TestBed } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/auth/test-config';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule(mergeTestConfig({}));
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

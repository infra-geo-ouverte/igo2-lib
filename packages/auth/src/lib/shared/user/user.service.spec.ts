import { TestBed } from '@angular/core/testing';

import { mergeTestConfig } from '../../../../test-config';
import { USER_AUTH_OPTIONS, UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        providers: [
          {
            provide: USER_AUTH_OPTIONS,
            useValue: {}
          },
          UserService
        ]
      })
    );
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

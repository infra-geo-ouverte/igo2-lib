import { TestBed, inject } from '@angular/core/testing';

import { provideMockTranslation } from '@igo2/core/language';
import { IgoMessageModule } from '@igo2/core/message';

import { mergeTestConfig } from 'packages/auth/test-config';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [IgoMessageModule],
        providers: [AuthService, provideMockTranslation()]
      })
    );
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});

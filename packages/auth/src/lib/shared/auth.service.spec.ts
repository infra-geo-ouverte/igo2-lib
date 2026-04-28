import { TestBed, inject } from '@angular/core/testing';

import { provideMockTranslation } from '@igo2/core/language';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideMockTranslation()]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});

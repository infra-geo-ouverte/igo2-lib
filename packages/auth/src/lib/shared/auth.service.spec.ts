import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { provideMockTranslation } from '@igo2/core/language';
import { IgoMessageModule } from '@igo2/core/message';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IgoMessageModule],
      providers: [
        AuthService,
        provideMockTranslation(),
        provideHttpClient(withInterceptorsFromDi())
      ]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});

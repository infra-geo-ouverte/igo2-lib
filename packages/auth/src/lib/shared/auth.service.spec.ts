import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import {
  IgoLanguageModule,
  provideMockRootTranslation
} from '@igo2/core/language';
import { IgoMessageModule } from '@igo2/core/message';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        provideMockRootTranslation(),
        IgoLanguageModule,
        IgoMessageModule
      ],
      providers: [AuthService]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});

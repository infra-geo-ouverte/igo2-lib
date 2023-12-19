import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import {
  IgoLanguageModule,
  IgoMessageModule,
  provideMockTranslation
} from '@igo2/core';

import { TranslateService } from '@ngx-translate/core';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        provideMockTranslation(),
        IgoLanguageModule,
        IgoMessageModule
      ],
      providers: [AuthService, TranslateService]
    });
  });

  it('should be created', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});

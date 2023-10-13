import { HttpClientModule } from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { IgoLanguageModule, IgoMessageModule } from '@igo2/core';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, IgoLanguageModule, IgoMessageModule],
      providers: [AuthService]
    });
  });

  it('should ...', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});

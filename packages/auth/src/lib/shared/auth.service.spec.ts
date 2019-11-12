import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

<<<<<<< HEAD
import { IgoLanguageModule, IgoMessageModule } from '@igo2/core';
=======
import { IgoMessageModule, IgoLanguageModule } from '@igo2/core';
>>>>>>> spatial filter tool

import { AuthService } from './auth.service';

describe('AuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
<<<<<<< HEAD
      imports: [HttpClientModule, IgoLanguageModule, IgoMessageModule],
=======
      imports: [HttpClientModule, IgoMessageModule, IgoLanguageModule],
>>>>>>> spatial filter tool
      providers: [AuthService]
    });
  });

  it('should ...', inject([AuthService], (service: AuthService) => {
    expect(service).toBeTruthy();
  }));
});

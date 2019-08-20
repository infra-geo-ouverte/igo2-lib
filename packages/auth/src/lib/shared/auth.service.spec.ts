import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule} from '@angular/common/http';

import { IgoLanguageModule } from '@igo2/core';

import { AuthService } from './auth.service';

describe('ShareMapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, IgoLanguageModule],
      providers: [AuthService]
    });
  });

  it(
    'should ...',
    inject([AuthService], (service: AuthService) => {
      expect(service).toBeTruthy();
    })
  );
});

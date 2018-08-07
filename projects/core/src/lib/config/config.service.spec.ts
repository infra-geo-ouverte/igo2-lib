import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ConfigService } from './config.service';

describe('ConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [ConfigService]
    });
  });

  it(
    'should ...',
    inject([ConfigService], (service: ConfigService) => {
      expect(service).toBeTruthy();
    })
  );
});

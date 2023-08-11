import { TestBed } from '@angular/core/testing';

import { AuthMonitoringService } from './auth-monitoring.service';
import { HttpClientModule } from '@angular/common/http';
import { IgoLanguageModule, MONITORING_OPTIONS } from '@igo2/core';
import { MOCK_MONITORING_OPTIONS } from 'packages/core/src/lib/monitoring/__mocks__/monitoring-mock';


describe('AuthMonitoringService', () => {
  let service: AuthMonitoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, IgoLanguageModule],
      providers: [
        { provide: MONITORING_OPTIONS, useValue: MOCK_MONITORING_OPTIONS }
      ]
    });
    service = TestBed.inject(AuthMonitoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

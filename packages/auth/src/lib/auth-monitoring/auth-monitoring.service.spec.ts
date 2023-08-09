import { TestBed } from '@angular/core/testing';

import { AuthMonitoringService } from './auth-monitoring.service';

describe('MonitoringService', () => {
  let service: AuthMonitoringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthMonitoringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import {
  AnyMonitoringOptions,
  ConfigService,
  IgoLanguageModule,
  MONITORING_OPTIONS,
  MessageService
} from '@igo2/core';

import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MOCK_MONITORING_OPTIONS } from 'packages/core/src/lib/monitoring/__mocks__/monitoring-mock';

import { IgoAuthModule } from '../auth.module';
import { AuthService } from '../shared';
import { AuthMonitoringService } from './auth-monitoring.service';

const initialize = (
  options: AnyMonitoringOptions = MOCK_MONITORING_OPTIONS
) => {
  TestBed.configureTestingModule({
    imports: [HttpClientModule, IgoAuthModule, IgoLanguageModule, ToastrModule],
    providers: [
      { provide: MONITORING_OPTIONS, useValue: options },
      { provide: ToastrService, useValue: ToastrService },
      { provide: MessageService, useValue: MessageService }
    ]
  });

  const configService = TestBed.inject(ConfigService);
  const authService = TestBed.inject(AuthService);
  const authMonitoringService = TestBed.inject(AuthMonitoringService);

  spyOn<any>(authMonitoringService, '_identifyUser');

  configService.load({});

  return { authMonitoringService, authService };
};

describe('AuthMonitoringService', () => {
  it('should be created', () => {
    const { authMonitoringService } = initialize();
    expect(authMonitoringService).toBeTruthy();
  });

  it('should not identify user if monitoring options are not set', () => {
    const { authMonitoringService } = initialize({
      ...MOCK_MONITORING_OPTIONS,
      identifyUser: false
    });
    expect(authMonitoringService['_identifyUser']).not.toHaveBeenCalled();
  });

  it('should identify user if monitoring options are set', () => {
    const { authMonitoringService, authService } = initialize();
    authService.authenticate$.next(true);
    expect(authMonitoringService['_identifyUser']).toHaveBeenCalled();
  });

  it('should reset user if the user logout', () => {
    const { authMonitoringService, authService } = initialize();

    // Login simulation
    authService.authenticate$.next(true);
    expect(authMonitoringService['_identifyUser']).toHaveBeenCalled();

    // Logout simulation
    authService.authenticate$.next(false);
    expect(authMonitoringService['_identifyUser']).toHaveBeenCalledWith(null);
  });
});

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';

import { AUTH_OPTIONS } from '../../auth/src/lib/shared/auth.interface';

const testProviders: (Provider | EnvironmentProviders)[] = [
  provideRouter([]),
  provideHttpClientTesting(),
  { provide: AUTH_OPTIONS, useValue: {} }
];

export default testProviders;

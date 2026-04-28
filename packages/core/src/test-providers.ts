import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';

const testProviders: (Provider | EnvironmentProviders)[] = [
  provideRouter([]),
  provideHttpClientTesting()
];

export default testProviders;

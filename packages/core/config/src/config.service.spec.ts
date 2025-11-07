import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { mergeTestConfig } from 'packages/core/test-config';

import { ConfigService } from './config.service';

describe('ConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [],
        providers: [ConfigService, provideHttpClient(withInterceptorsFromDi())]
      })
    );
  });

  it('should ...', inject([ConfigService], (service: ConfigService) => {
    expect(service).toBeTruthy();
  }));
});

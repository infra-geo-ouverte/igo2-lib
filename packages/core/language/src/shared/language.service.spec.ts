import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { TestBed, inject } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';

import { mergeTestConfig } from '../../../test-config';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      mergeTestConfig({
        imports: [TranslateModule.forRoot()],
        providers: [provideHttpClient(withInterceptorsFromDi())]
      })
    );
  });

  it('should ...', inject([LanguageService], (service: LanguageService) => {
    expect(service).toBeTruthy();
  }));
});

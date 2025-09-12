import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestModuleMetadata } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { IgoLanguageModule, provideMockTranslation } from '@igo2/core/language';

export const TEST_CONFIG: TestModuleMetadata = {
  imports: [IgoLanguageModule],
  providers: [
    provideRouter([]),
    provideHttpClientTesting(),
    provideHttpClient(),
    provideMockTranslation()
  ]
};

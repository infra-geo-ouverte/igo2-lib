import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestModuleMetadata } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideMockTranslation } from '@igo2/core/language';

export const TEST_CONFIG: TestModuleMetadata = {
  providers: [
    provideRouter([]),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideZonelessChangeDetection(),
    provideMockTranslation()
  ]
};

export function mergeTestConfig(
  moduleDef: TestModuleMetadata
): TestModuleMetadata {
  return {
    ...moduleDef,
    providers: [...(moduleDef.providers ?? []), ...TEST_CONFIG.providers!]
  };
}

import { HttpBackend } from '@angular/common/http';

import { TranslateLoader } from '@ngx-translate/core';

import { ConfigService } from '../../config/config.service';
import { LanguageLoader } from './language.loader';

export function defaultLanguageLoader(
  http: HttpBackend,
  config?: ConfigService
) {
  return new LanguageLoader(http, undefined, undefined, config);
}

export function provideLanguageLoader(loader?) {
  return {
    provide: TranslateLoader,
    useFactory: loader || defaultLanguageLoader,
    deps: [HttpBackend]
  };
}

export function provideDefaultLanguageLoader(loader?) {
  return {
    provide: TranslateLoader,
    useFactory: loader || defaultLanguageLoader,
    deps: [HttpBackend, ConfigService]
  };
}

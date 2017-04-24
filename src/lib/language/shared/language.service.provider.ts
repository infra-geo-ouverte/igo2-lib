import { Http } from '@angular/http';
import { TranslateLoader } from '@ngx-translate/core';

import { LanguageLoader } from './language-loader';

export interface LanguageModuleConfig {
  loader?: (http: Http) => LanguageLoader;
}

export function defaultTranslateLoader() {
  return new LanguageLoader();
}

export function provideLanguageService(config: LanguageModuleConfig = {}) {
  return {
    provide: TranslateLoader,
    useFactory: (config.loader) || (defaultTranslateLoader),
    deps: [Http]
  };
}

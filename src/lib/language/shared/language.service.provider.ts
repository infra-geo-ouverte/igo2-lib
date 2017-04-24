import { Http } from '@angular/http';
import { TranslateLoader } from '@ngx-translate/core';

import { LanguageIgoLoader } from './language-igo-loader';

export interface LanguageModuleConfig {
  loader?: (http: Http) => LanguageIgoLoader;
}

export function defaultTranslateLoader(http: Http) {
  return new LanguageIgoLoader();
}

export function provideLanguageService(config: LanguageModuleConfig = {}) {
  return {
    provide: TranslateLoader,
    useFactory: (config.loader) || (defaultTranslateLoader),
    deps: [Http]
  };
}

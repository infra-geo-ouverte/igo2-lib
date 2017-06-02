import { Http } from '@angular/http';
import { TranslateLoader } from '@ngx-translate/core';

import { ConfigService } from '../../config';
import { LanguageLoader } from './language.loader';


export function defaultLanguageLoader(http: Http, config?: ConfigService) {
  return new LanguageLoader(http, undefined, undefined, config);
}

export function provideLanguageLoader(loader?) {

  return {
    provide: TranslateLoader,
    useFactory: (loader) || (defaultLanguageLoader),
    deps: [Http]
  };
}

export function provideDefaultLanguageLoader(loader?) {

  return {
    provide: TranslateLoader,
    useFactory: (loader) || (defaultLanguageLoader),
    deps: [Http, ConfigService]
  };
}

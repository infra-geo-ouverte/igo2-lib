import {
  EnvironmentProviders,
  Provider,
  importProvidersFrom,
  makeEnvironmentProviders
} from '@angular/core';

import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule
} from '@ngx-translate/core';

export function provideMockTranslation(
  loader?: Provider
): EnvironmentProviders {
  return makeEnvironmentProviders([
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateFakeLoader
        }
      })
    )
  ]);
}

import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { provideTranslateService } from '@ngx-translate/core';

export function provideMockTranslation(): EnvironmentProviders {
  return makeEnvironmentProviders([provideTranslateService()]);
}

import { ImportProvidersSource, Provider } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

export function provideMockRootTranslation(
  loader?: Provider
): ImportProvidersSource {
  return TranslateModule.forRoot();
}

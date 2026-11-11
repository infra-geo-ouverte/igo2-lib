import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EnvironmentProviders, Provider } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideTranslateService } from '@ngx-translate/core';

const testProviders: (Provider | EnvironmentProviders)[] = [
  provideRouter([]),
  provideHttpClientTesting(),
  provideTranslateService() // WORKAROUND, the import cross module not working with the providersFile, the import should be delegated to the @igo2/core module : provideMockTranslation()
];

export default testProviders;

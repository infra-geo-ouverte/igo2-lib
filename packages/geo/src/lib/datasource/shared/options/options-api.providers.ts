import { HttpClient } from '@angular/common/http';

import { ConfigService } from '@igo2/core';

import { OptionsService } from './options.service';
import { OptionsApiService } from './options-api.service';

export function optionsApiFactory(
  http: HttpClient,
  configService: ConfigService
) {
  return new OptionsApiService(http, configService.getConfig('optionsApi'));
}

export function provideOptionsApi() {
  return {
    provide: OptionsService,
    useFactory: optionsApiFactory,
    deps: [HttpClient, ConfigService]
  };
}

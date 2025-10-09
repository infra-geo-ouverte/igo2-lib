import { OptionsApiService } from './options-api.service';
import { OptionsService } from './options.service';

export function optionsApiFactory() {
  return new OptionsApiService();
}

export function provideOptionsApi() {
  return {
    provide: OptionsService,
    useFactory: optionsApiFactory
  };
}

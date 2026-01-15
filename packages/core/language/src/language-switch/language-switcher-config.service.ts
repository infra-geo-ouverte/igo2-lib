import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';

import { LanguageOptions } from '../shared/language.interface';

@Injectable({ providedIn: 'root' })
export class LanguageSwitcherConfigService {
  private configService = inject(ConfigService);

  getSwitcherConfig(): boolean {
    const languageConfig =
      this.configService.getConfig<LanguageOptions>('language');

    const enabled = languageConfig?.switcher?.enabled ?? false;

    return enabled;
  }
}

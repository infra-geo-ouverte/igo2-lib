import { Injectable, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { LanguageOptions } from '@igo2/core/language';

@Injectable({ providedIn: 'root' })
export class LanguageSwitcherConfigService {
  private configService = inject(ConfigService);

  getSwitcherConfig(): { enabled: boolean; position: 'header' | 'sidebar' } {
    const languageConfig =
      this.configService.getConfig<LanguageOptions>('language');

    const hasHeader = this.configService.getConfig<boolean>(
      'header.hasHeader',
      true
    );

    const enabled = languageConfig?.switcher?.enabled ?? false;

    const position =
      languageConfig?.switcher?.position ?? (hasHeader ? 'header' : 'sidebar');

    return { enabled, position };
  }
}

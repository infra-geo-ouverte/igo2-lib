import { Component } from '@angular/core';

import { ConfigService, LanguageOptions } from '@igo2/core';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class AppConfigComponent {
  public configLanguage: LanguageOptions;

  constructor(private configService: ConfigService) {
    this.configLanguage = this.configService.getConfig('language');
  }
}

import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ConfigService } from '@igo2/core/config';
import { LanguageOptions } from '@igo2/core/language';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  imports: [DocViewerComponent, ExampleViewerComponent, JsonPipe]
})
export class AppConfigComponent {
  private configService = inject(ConfigService);

  public configLanguage: LanguageOptions;

  constructor() {
    this.configLanguage = this.configService.getConfig('language');
  }
}

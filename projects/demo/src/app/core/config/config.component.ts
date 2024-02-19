import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';

import { ConfigService, LanguageOptions } from '@igo2/core';

import { DocViewerComponent } from '../../components/doc-viewer/doc-viewer.component';
import { ExampleViewerComponent } from '../../components/example/example-viewer/example-viewer.component';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
  standalone: true,
  imports: [DocViewerComponent, ExampleViewerComponent, JsonPipe]
})
export class AppConfigComponent {
  public configLanguage: LanguageOptions;

  constructor(private configService: ConfigService) {
    this.configLanguage = this.configService.getConfig('language');
  }
}

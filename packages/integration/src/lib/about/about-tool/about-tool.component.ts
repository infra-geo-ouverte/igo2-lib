import { Component, Input } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { ConfigService, Version } from '@igo2/core';
import { of } from 'rxjs';
import type { Observable } from 'rxjs';

@ToolComponent({
  name: 'about',
  title: 'igo.integration.tools.about',
  icon: 'help-circle'
})
@Component({
  selector: 'igo-about-tool',
  templateUrl: './about-tool.component.html',
  styleUrls: ['./about-tool.component.scss']
})
export class AboutToolComponent {
  @Input()
  get html() {
    return this._html;
  }
  set html(value: string) {
    this._html = Array.isArray(value) ? value.join('\n') : value;
  }
  private _discoverTitleInLocale: string = 'IGO';
  public discoverTitleInLocale$: Observable<string> = of(this._discoverTitleInLocale);

  @Input()
  get discoverTitleInLocale() {
    return this._discoverTitleInLocale;
  }
  set discoverTitleInLocale(value: string) {
    this._discoverTitleInLocale = value;
    this.discoverTitleInLocale$ = of(value);
  }


  public version: Version;
  private _html: string = 'igo.integration.about.html';

  constructor(configService: ConfigService) {
    this.version = configService.getConfig('version');
  }
}

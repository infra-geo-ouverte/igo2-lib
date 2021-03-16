import { Component, Input } from '@angular/core';

import { ToolComponent } from '@igo2/common';
import { ConfigService, Version } from '@igo2/core';
import { of } from 'rxjs';
import type { Observable } from 'rxjs';
import { AuthService } from '@igo2/auth';
import { HttpClient } from '@angular/common/http';

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

  public trainingGuideURL;

  public version: Version;
  private _html: string = 'igo.integration.aboutTool.html';

  private baseUrlProfils = '/apis/igo2/user/igo?';

  private baseUrlGuide = '/apis/depot/projects/Documentation/files/';

  constructor(
    public configService: ConfigService,
    public auth: AuthService,
    private http: HttpClient,) {
    this.version = configService.getConfig('version');
  }

  ngOnInit() {
    this.http.get(this.baseUrlProfils).subscribe((profil) => {
      console.log(profil);
      const recast = profil as any;
      this.trainingGuideURL = recast.guides[0];
      console.log(this.trainingGuideURL);
    });
  }

  openGuide() {
    window.open(this.baseUrlGuide + this.trainingGuideURL, '_blank');
  }
}

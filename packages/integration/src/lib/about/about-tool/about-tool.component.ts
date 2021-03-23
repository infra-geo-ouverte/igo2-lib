import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

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
export class AboutToolComponent implements OnInit {
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

  public trainingGuideURLs;

  public version: Version;
  private _html: string = 'igo.integration.aboutTool.html';

  private baseUrlProfil = '/apis/igo2/user/igo?';
  private baseUrlGuide = '/apis/depot/projects/Documentation/files/';

  constructor(
    public configService: ConfigService,
    public auth: AuthService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef) {
    this.version = configService.getConfig('version');
  }

  ngOnInit() {
    this.http.get(this.baseUrlProfil).subscribe((profil) => {
      const recast = profil as any;
      this.trainingGuideURLs = recast.guides;
      this.cdRef.detectChanges();
    });
  }

  openGuide() {
    for (const trainingGuideURL of this.trainingGuideURLs) {
      this.http
      .get(this.baseUrlGuide + trainingGuideURL + '?', {
        responseType: 'blob'
      })
      .subscribe((response) => {
        const blob = new Blob([response]);
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = trainingGuideURL;
        anchor.click();
        URL.revokeObjectURL(url);
      });
    }
  }
}

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

  private baseUrlProfil;
  private baseUrlGuide;

  constructor(
    public configService: ConfigService,
    public auth: AuthService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef) {
    this.version = configService.getConfig('version');
    this.baseUrlProfil = configService.getConfig('context.url') + '/user/igo?';
    this.baseUrlGuide = configService.getConfig('depot.url') + '/projects/Documentation/files/';
  }

  ngOnInit() {
    if (this.auth.authenticated) {
      this.http.get(this.baseUrlProfil).subscribe((profil) => {
        const recast = profil as any;
        this.trainingGuideURLs = recast.guides;
        console.log(this.trainingGuideURLs)
        this.cdRef.detectChanges();
      });
    }
  }

  openGuide(guide?) {
    const url = guide ?
      this.baseUrlGuide + guide + '?' :
      this.baseUrlGuide + this.trainingGuideURLs[0] + '?';
    console.log(url);
    this.http
    .get(url, {
      responseType: 'blob'
    })
    .subscribe(() => {
      window.open(url, '_blank');
    });
  }
}

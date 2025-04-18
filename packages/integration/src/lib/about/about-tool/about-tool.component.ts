import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '@igo2/auth';
import { CustomHtmlComponent } from '@igo2/common/custom-html';
import { InteractiveTourComponent } from '@igo2/common/interactive-tour';
import { ToolComponent } from '@igo2/common/tool';
import { ConfigService, version } from '@igo2/core/config';
import { LanguageService } from '@igo2/core/language';
import { IgoLanguageModule } from '@igo2/core/language';

import { of } from 'rxjs';
import type { Observable } from 'rxjs';

import { AllEnvironmentOptions } from '../../environment';

@ToolComponent({
  name: 'about',
  title: 'igo.integration.tools.about',
  icon: 'help'
})
@Component({
  selector: 'igo-about-tool',
  templateUrl: './about-tool.component.html',
  styleUrls: ['./about-tool.component.scss'],
  standalone: true,
  imports: [
    InteractiveTourComponent,
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    NgFor,
    CustomHtmlComponent,
    IgoLanguageModule
  ]
})
export class AboutToolComponent implements OnInit {
  private configOptions: AllEnvironmentOptions;
  @Input()
  get headerHtml() {
    return this._headerHtml;
  }
  set headerHtml(value: string) {
    this._headerHtml = Array.isArray(value) ? value.join('\n') : value;
  }

  @Input()
  get html() {
    return this._html;
  }
  set html(value: string) {
    this._html = Array.isArray(value) ? value.join('\n') : value;
  }
  private _discoverTitleInLocale = 'IGO';
  public discoverTitleInLocale$: Observable<string> = of(
    this._discoverTitleInLocale
  );

  @Input()
  get discoverTitleInLocale() {
    return this._discoverTitleInLocale;
  }
  set discoverTitleInLocale(value: string) {
    this._discoverTitleInLocale = value;
    this.discoverTitleInLocale$ = of(value);
  }

  @Input() trainingGuideURLs;

  public effectiveVersion: string;
  private _html = 'igo.integration.aboutTool.html';
  private _headerHtml: string;

  private baseUrlProfil;
  private baseUrlGuide;

  public loading = false;

  constructor(
    public configService: ConfigService,
    public auth: AuthService,
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private languageService: LanguageService
  ) {
    this.headerHtml = this.languageService.translate.instant(
      'igo.integration.aboutTool.headerHtml'
    );
    this.configOptions = this.configService.getConfigs();
    const configVersion = this.configOptions.version;
    this.effectiveVersion =
      configVersion?.app || configVersion?.lib || version.lib;
    this.baseUrlProfil = this.configOptions.storage?.url;
    this.baseUrlGuide =
      this.configOptions.depot?.url +
      // todo validate this property
      (this.configOptions.depot as any)?.guideUrl;
  }

  ngOnInit() {
    if (this.auth.authenticated && this.configOptions.context?.url) {
      this.http.get(this.baseUrlProfil).subscribe((profil) => {
        const recast = profil as any;
        this.trainingGuideURLs = recast.guides;
        this.cdRef.detectChanges();
      });
    } else if (
      this.auth.authenticated &&
      !this.configOptions.context?.url &&
      this.configOptions.depot?.trainingGuides
    ) {
      this.trainingGuideURLs = this.configOptions.depot?.trainingGuides;
    }
  }

  openGuide(guide?) {
    this.loading = true;
    const url = guide
      ? this.baseUrlGuide + guide + '?'
      : this.baseUrlGuide + this.trainingGuideURLs[0] + '?';
    this.http
      .get(url, {
        responseType: 'blob'
      })
      .subscribe(() => {
        this.loading = false;
        window.open(url, '_blank');
        this.cdRef.detectChanges();
      });
  }

  formatFileName(name: string) {
    name = name.split('_').join(' ');
    const index = name.indexOf('.');
    name = name.slice(0, index);
    return name;
  }
}
